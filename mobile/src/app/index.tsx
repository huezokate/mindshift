import { Redirect } from 'expo-router';

// Entry point. Until Clerk lands (step 6) everyone starts at the vent flow,
// matching the web's anon-friendly entry. Step 6 sends signed-in users to /home.
export default function Index() {
  return <Redirect href="/onboarding" />;
}
