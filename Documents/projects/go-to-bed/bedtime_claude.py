#!/usr/bin/env python3
"""
bedtime_claude.py — Pixel Claude walks across your screen and tells you to sleep.
Run manually or schedule with cron: 0 23 * * * /usr/bin/python3 /path/to/bedtime_claude.py
"""

import tkinter as tk
import threading
import time
import sys
import os
import shlex
import subprocess

# ─── Pixel art frames for Claude walking ───────────────────────────────────────
# Each frame is a 16x16 grid of color codes
# Colors: ' '=transparent, 'S'=skin/face, 'B'=black outline, 'W'=white, 
#         'O'=orange accent, 'R'=rust/brown, 'G'=gray, 'P'=pink blush

PALETTE = {
    ' ': None,
    'B': '#1a1a2e',
    'S': '#FFD6A5',
    'W': '#FFFFFF',
    'O': '#E85D04',
    'R': '#9D2A00',
    'G': '#6B7280',
    'P': '#FFB3C1',
    'Y': '#FFF3B0',
    'D': '#374151',
    'L': '#F3F4F6',
    'C': '#60A5FA',  # Claude blue
    'N': '#1D4ED8',  # dark blue
}

# Frame 1 - standing, right leg forward
FRAME1 = [
    "    BBBBB     ",
    "   BSSSSSB    ",
    "   BSWWWSB    ",
    "   BSOOOSB    ",
    "   BSWWWSB    ",
    "   BSSSSSB    ",
    "   BCCCCB     ",
    "  BNCCCCCNB   ",
    "  BNCCCCCNB   ",
    "   BCCCCB     ",
    "   BD  DB     ",
    "   BD  DB     ",
    "   BDB BDB    ",
    "    B   B     ",
]

# Frame 2 - mid-stride
FRAME2 = [
    "    BBBBB     ",
    "   BSSSSSB    ",
    "   BSWWWSB    ",
    "   BSOOOSB    ",
    "   BSWWWSB    ",
    "   BSSSSSB    ",
    "   BCCCCB     ",
    "  BNCCCCCNB   ",
    "  BNCCCCCNB   ",
    "   BCCCCB     ",
    "  BDB  DB     ",
    " BDB    DB    ",
    " BDB    BDB   ",
    "  B      B    ",
]

# Frame 3 - left leg forward
FRAME3 = [
    "    BBBBB     ",
    "   BSSSSSB    ",
    "   BSWWWSB    ",
    "   BSOOOSB    ",
    "   BSWWWSB    ",
    "   BSSSSSB    ",
    "   BCCCCB     ",
    "  BNCCCCCNB   ",
    "  BNCCCCCNB   ",
    "   BCCCCB     ",
    "   BD  DB     ",
    "   BD  BD     ",
    "   BDB  BDB   ",
    "    B   B     ",
]

FRAMES = [FRAME1, FRAME2, FRAME3, FRAME2]

PIXEL = 5  # pixel size in display pixels
SPRITE_W = 14 * PIXEL
SPRITE_H = 14 * PIXEL

MESSAGES = [
    "Kate, close the laptop. 🌙",
    "Your deep sleep score is watching you.",
    "The vibecode will still be there tomorrow.",
    "Seriously. Bed. Now. I'll still be here.",
    "Your HRV deserves better than this.",
]

import random
MESSAGE = random.choice(MESSAGES)


class BedtimeClaude:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Claude says goodnight")
        
        # Get screen dimensions
        self.sw = self.root.winfo_screenwidth()
        self.sh = self.root.winfo_screenheight()
        
        # Window setup — always on top, no chrome
        self.root.overrideredirect(True)
        self.root.attributes('-topmost', True)
        self.root.attributes('-alpha', 0.97)
        self.root.configure(bg='#000001')
        self.root.wm_attributes('-transparentcolor', '#000001')
        
        # Canvas for sprite + bubble
        self.bubble_w = 280
        self.bubble_h = 80
        self.total_w = max(self.bubble_w + 20, SPRITE_W + 40)
        self.total_h = SPRITE_H + self.bubble_h + 20
        
        self.canvas = tk.Canvas(
            self.root,
            width=self.total_w,
            height=self.total_h,
            bg='#000001',
            highlightthickness=0
        )
        self.canvas.pack()
        
        # Start off-screen right
        self.x = self.sw + 20
        self.y = self.sh - self.total_h - 60
        self.root.geometry(f"{self.total_w}x{self.total_h}+{self.x}+{self.y}")
        
        self.frame_idx = 0
        self.direction = -1  # moving left
        self.speed = 3
        self.paused = False
        self.pause_timer = 0
        self.bubble_visible = False
        self.fade_out = False
        self.alpha = 0.97
        self.snooze_mode = False
        self._launch_snooze = False

        self.canvas.bind('<Button-1>', self._on_canvas_click)
        self._draw_frame()
        self._animate()
        
        self.root.mainloop()

    def _draw_pixel_frame(self, frame_data, offset_x, offset_y):
        """Draw a pixel art frame onto the canvas."""
        for row_i, row in enumerate(frame_data):
            for col_i, ch in enumerate(row):
                color = PALETTE.get(ch)
                if color is None:
                    continue
                x0 = offset_x + col_i * PIXEL
                y0 = offset_y + row_i * PIXEL
                x1 = x0 + PIXEL
                y1 = y0 + PIXEL
                self.canvas.create_rectangle(x0, y0, x1, y1, fill=color, outline='')

    def _draw_speech_bubble(self, show):
        """Draw speech bubble above Claude."""
        if not show:
            return
        bx = 5
        by = 5
        bw = self.bubble_w
        bh = self.bubble_h - 10
        r = 12

        # Bubble background
        self.canvas.create_rectangle(bx+r, by, bx+bw-r, by+bh, fill='#1D4ED8', outline='')
        self.canvas.create_rectangle(bx, by+r, bx+bw, by+bh-r, fill='#1D4ED8', outline='')
        # Corners
        for cx, cy in [(bx+r, by+r), (bx+bw-r, by+r), (bx+r, by+bh-r), (bx+bw-r, by+bh-r)]:
            self.canvas.create_oval(cx-r, cy-r, cx+r, cy+r, fill='#1D4ED8', outline='')
        
        # Tail pointing down-left
        tail_x = bx + 40
        tail_y = by + bh
        self.canvas.create_polygon(
            tail_x, tail_y,
            tail_x + 16, tail_y,
            tail_x + 8, tail_y + 16,
            fill='#1D4ED8', outline=''
        )

        # Border
        self.canvas.create_arc(bx, by, bx+r*2, by+r*2, start=90, extent=90, outline='#93C5FD', width=2, style='arc')
        self.canvas.create_arc(bx+bw-r*2, by, bx+bw, by+r*2, start=0, extent=90, outline='#93C5FD', width=2, style='arc')
        self.canvas.create_arc(bx, by+bh-r*2, bx+r*2, by+bh, start=180, extent=90, outline='#93C5FD', width=2, style='arc')
        self.canvas.create_arc(bx+bw-r*2, by+bh-r*2, bx+bw, by+bh, start=270, extent=90, outline='#93C5FD', width=2, style='arc')
        self.canvas.create_line(bx+r, by, bx+bw-r, by, fill='#93C5FD', width=2)
        self.canvas.create_line(bx+r, by+bh, tail_x, by+bh, fill='#93C5FD', width=2)
        self.canvas.create_line(tail_x+16, by+bh, bx+bw-r, by+bh, fill='#93C5FD', width=2)
        self.canvas.create_line(bx, by+r, bx, by+bh-r, fill='#93C5FD', width=2)
        self.canvas.create_line(bx+bw, by+r, bx+bw, by+bh-r, fill='#93C5FD', width=2)

        # Text
        display_text = "Fine. 15 more minutes. 😑" if self.snooze_mode else MESSAGE
        self.canvas.create_text(
            bx + bw // 2, by + bh // 2,
            text=display_text,
            fill='#FFFFFF',
            font=('Helvetica', 11, 'bold'),
            width=bw - 20,
            justify='center'
        )

    def _draw_frame(self):
        self.canvas.delete('all')
        sprite_x = (self.total_w - SPRITE_W) // 2
        sprite_y = self.bubble_h + 10
        self._draw_speech_bubble(self.bubble_visible)
        self._draw_pixel_frame(FRAMES[self.frame_idx], sprite_x, sprite_y)

    def _on_canvas_click(self, event):
        """Handle canvas click — snooze if bubble is visible."""
        if not self.bubble_visible or self.fade_out:
            return
        self.snooze_mode = True
        self._draw_frame()
        self.root.after(800, self._begin_snooze_fade)

    def _begin_snooze_fade(self):
        """Transition from snooze message display into fade-out."""
        self._launch_snooze = True
        self.fade_out = True

    def _spawn_snooze_relaunch(self):
        """Launch a detached background process to relaunch this script in 15 minutes."""
        script = os.path.abspath(__file__)
        python = sys.executable
        cmd = f'sleep 900 && {shlex.quote(python)} {shlex.quote(script)}'
        subprocess.Popen(
            ['sh', '-c', cmd],
            start_new_session=True,
            close_fds=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    def _animate(self):
        if self.fade_out:
            self.alpha -= 0.04
            if self.alpha <= 0:
                if self._launch_snooze:
                    self._spawn_snooze_relaunch()
                self.root.destroy()
                return
            self.root.attributes('-alpha', max(0, self.alpha))
            self.root.after(40, self._animate)
            return

        if self.paused:
            self.pause_timer -= 1
            if self.pause_timer <= 0:
                self.paused = False
                self.bubble_visible = False
                self.direction = -1
                self.speed = 4
            self._draw_frame()
            self.root.after(80, self._animate)
            return

        # Move sprite
        self.x += self.direction * self.speed
        self.root.geometry(f"{self.total_w}x{self.total_h}+{self.x}+{self.y}")

        # Pause in center of screen and show bubble
        center_zone = self.sw // 2 - self.total_w // 2
        if not self.bubble_visible and self.x <= center_zone + 10 and self.x >= center_zone - 10:
            self.paused = True
            self.bubble_visible = True
            self.pause_timer = 60  # ~5 seconds at 80ms
            self.direction = 0

        # Walk off left edge → fade out
        if self.x < -self.total_w - 20:
            self.fade_out = True

        # Cycle walking frame
        self.frame_idx = (self.frame_idx + 1) % len(FRAMES)
        self._draw_frame()
        self.root.after(120, self._animate)


if __name__ == '__main__':
    BedtimeClaude()
