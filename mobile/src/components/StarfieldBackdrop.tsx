import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: Animated.Value;
  size: number;
  opacity: number;
  color: string;
  speed: number;
}

const STAR_COLORS = ['#faf9f5', '#f58420', '#d946ef', '#06b6d4']; // white, hti orange, magenta, cyan

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function createStars(): Star[] {
  return Array.from({ length: 40 }, (_, i) => {
    const base = i + 1;
    return {
      id: i,
      x: seededRandom(base * 11) * width,
      y: new Animated.Value(seededRandom(base * 17) * height),
      size: seededRandom(base * 23) * 2.5 + 1.2,
      opacity: seededRandom(base * 29) * 0.7 + 0.3,
      color: STAR_COLORS[Math.floor(seededRandom(base * 31) * STAR_COLORS.length)],
      speed: seededRandom(base * 37) * 4000 + 4000,
    };
  });
}

export default function StarfieldBackdrop() {
  const [stars] = useState(createStars);

  useEffect(() => {
    const animations = stars.map((star) => {
      const startAnimation = (val: Animated.Value) => {
        Animated.sequence([
          Animated.timing(val, {
            toValue: height + 20,
            duration: star.speed,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            val.setValue(-20);
            startAnimation(val);
          }
        });
      };

      startAnimation(star.y);
      return star.y;
    });

    return () => {
      animations.forEach((anim) => anim.stopAnimation());
    };
  }, [stars]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              transform: [{ translateY: star.y }],
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
              backgroundColor: star.color,
              shadowColor: star.color,
              shadowOpacity: 0.8,
              shadowRadius: 2,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
  },
});
