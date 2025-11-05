import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import UserCard from "../components/UserCard";

export default function Profile() {
  // Nhận params từ login
  const params = useLocalSearchParams<{ user: string }>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Parse user JSON khi params thay đổi
  useEffect(() => {
    if (params.user) {
      try {
        setCurrentUser(JSON.parse(params.user));
      } catch (err) {
        console.error("Lỗi parse user params:", err);
        setCurrentUser(null);
      }
    }
    setLoading(false);
  }, [params.user]);

  const handleEdit = () => {
    Alert.alert("Chỉnh sửa", "Chức năng chỉnh sửa đang phát triển");
  };

  const handleDelete = () => {
    Alert.alert("Xóa", "Bạn có chắc muốn xóa?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: () => console.log("Deleted") },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#fff" }}>Không có dữ liệu người dùng</Text>
      </View>
    );
  }

  // Xử lý đường dẫn ảnh
  const LOCALHOST = Platform.OS === "android" ? "10.0.2.2" : "172.20.10.3";
  const imageUri =
    currentUser.image?.startsWith("http") ? currentUser.image : `http://${LOCALHOST}:4000${currentUser.image}`;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: imageUri }} style={styles.avatar} />
        <Text style={styles.username}>{currentUser.username}</Text>
        <Text style={styles.email}>{currentUser.email}</Text>
      </View>

      {/* User Card */}
      <View style={styles.cardWrapper}>
        <UserCard user={currentUser} onEdit={handleEdit} onDelete={handleDelete} />
      </View>

      {/* Chi tiết thông tin */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Chi tiết tài khoản</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username:</Text>
          <Text style={styles.infoValue}>{currentUser.username}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{currentUser.email}</Text>
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E1E2F", paddingHorizontal: 16, paddingTop: 40 },
  loadingContainer: { flex: 1, backgroundColor: "#1E1E2F", justifyContent: "center", alignItems: "center" },
  headerContainer: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 12, backgroundColor: "#ddd" },
  username: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  email: { fontSize: 16, color: "#aaa" },
  cardWrapper: { backgroundColor: "#2C2C3E", borderRadius: 16, padding: 16, marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  infoSection: { backgroundColor: "#2C2C3E", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  infoTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 12 },
  infoRow: { flexDirection: "row", marginBottom: 8 },
  infoLabel: { color: "#aaa", width: 100 },
  infoValue: { color: "#fff", fontWeight: "500" },
  editButton: { marginTop: 16, backgroundColor: "#007AFF", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  editButtonText: { color: "#fff", fontWeight: "bold" },
});
