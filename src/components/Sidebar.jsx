import { FlickeringGrid } from "@/components/ui/flickering-grid";
import React from 'react';

export function FlickeringGridRoundedDemo() {
  return (
    <div className="h-screen w-full ">
      <FlickeringGrid        className="relative inset-0 z-0 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"        squareSize={4}gridGap={6}       color="#60A5FA"      maxOpacity={0.7}        flickerChance={0.1}    />
    </div>
  );
}

export default FlickeringGridRoundedDemo
