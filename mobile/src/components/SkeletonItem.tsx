import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";

interface Props {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
}

export default function SkeletonItem({
  width = "100%",
  height = 20,
  style,
  borderRadius = 8,
}: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  // width string ise (örn: "100%") ViewStyle olarak kabul et
  const widthStyle: ViewStyle =
    typeof width === "string"
      ? { width: width as `${number}%` | "auto" }
      : { width };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        widthStyle,
        {
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "rgba(255, 255, 255, 0.12)", // Koyu temaya uygun gri/beyaz
  },
});
