import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export function ShieldFlash() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  return visible ? (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: "30%",
        left: 12,
        right: 12,
        zIndex: 35,
        backgroundColor: "#5DD9E9BB",
        borderColor: "#D8FFFF",
        borderWidth: 3,
        borderRadius: 24,
        padding: 20,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 52, color: "white" }}>⬡ ⬡ ⬡</Text>
      <Text style={{ fontWeight: "bold", color: "#10233E" }}>
        SHIELD · 80% BLOCKED
      </Text>
    </View>
  ) : null;
}
