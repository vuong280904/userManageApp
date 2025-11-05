// components/UserCard.tsx
import React from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  user: any;
  onEdit: () => void;
  onDelete: () => void;
}

export default function UserCard({ user, onEdit, onDelete }: Props) {
  const LOCALHOST = Platform.OS === "android" ? "10.0.2.2" : "172.20.10.3";
  const imageUri = user.image?.startsWith("http") ? user.image : `http://${LOCALHOST}:4000${user.image}`;
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUri }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={{ color: "white" }}>{user.email}</Text>
      </View>
      <TouchableOpacity onPress={onEdit} style={styles.action}>
        <Text>✏️</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.action}>
        <Text style={{ color: "red" }}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: "#eee" },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12, backgroundColor: "#ddd" },
  username: { color: "#fff",fontWeight: "700" },
  action: { paddingHorizontal: 8 },
});
