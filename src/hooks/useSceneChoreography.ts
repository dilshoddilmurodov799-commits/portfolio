import { useLayoutEffect } from 'react';
import { ScrollTrigger } from '../lib/gsap';
import { sceneState } from '../lib/sceneState';

/**
 * Maps page scroll onto the WebGL scene: which formation is showing, how far the hero
 * has scrolled away and overall page progress. Runs in the shell so it is created after
 * the sections' own triggers (including the pinned reel), keeping positions correct.
 */
export function useSceneChoreography() {
  useLayoutEffect(() => {
    const progress = [0, 0, 0];
    const sync = () => {
      sceneState.morph = progress[0] + progress[1] + progress[2];
      sceneState.invalidate();
    };
    const transition = (trigger: string, i: number, start: string, end: string) =>
      ScrollTrigger.create({
        trigger,
        start,
        end,
        onUpdate: (self) => {
          progress[i] = self.progress;
          sync();
        },
        onRefresh: (self) => {
          progress[i] = self.progress;
          sync();
        },
      });

    const triggers = [
      transition('#about', 0, 'top 85%', 'top 20%'),
      transition('#work', 1, 'top 80%', 'top 10%'),
      transition('#contact', 2, 'top 85%', 'top 15%'),
      ScrollTrigger.create({
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          sceneState.heroExit = self.progress;
          sceneState.invalidate();
        },
      }),
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          sceneState.scroll = self.progress;
        },
      }),
    ];
    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);
}
