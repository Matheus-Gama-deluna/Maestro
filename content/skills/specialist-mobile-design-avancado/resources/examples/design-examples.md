# Exemplos - Mobile Design

## Design Tokens
```json
{
  "colors": {
    "primary": "#007AFF",
    "secondary": "#5856D6",
    "background": "#FFFFFF"
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24
  },
  "typography": {
    "heading1": {
      "fontSize": 28,
      "fontWeight": "bold"
    }
  }
}
```

## Micro-interactions
```tsx
const AnimatedButton = () => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress}>
        <Text>Press me</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
```
