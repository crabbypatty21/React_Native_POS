import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* The 'name' must match your filename (index.tsx). 
         'title' is what appears in the top left header.
      */}
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Crabby Dashboard", // Change this to whatever you want!
          headerTitleAlign: 'center', // Optional: Centers the title on Android
        }} 
      />
    </Stack>
  );
}