import { view } from './storybook.requires';

// No storage passed: story-selection persistence would need AsyncStorage
// (a native module we haven't adopted — theme persistence uses SecureStore).
// Deep links (…/storybook?STORYBOOK_STORY_ID=<id>) cover jump-to-story.
const StorybookUIRoot = view.getStorybookUI({
  shouldPersistSelection: false,
});

export default StorybookUIRoot;
