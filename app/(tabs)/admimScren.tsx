import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";
import UserCard from "../components/UserCard";

// 🌐 Địa chỉ server backend
const LOCALHOST = Platform.OS === "android" ? "10.0.2.2" : "172.20.10.3";
const API_URL = `http://${LOCALHOST}:4000/api/users`;
const safeJson = async (res: Response) => {
  const ct = res.headers.get?.("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }
  const text = await res.text();
  return { _raw: text };
};

export default function AdminScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
   const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          router.replace("/"); // 🔁 trở về trang index
        },
      },
    ]);
  };

  // 🧩 Tải danh sách người dùng
  const loadUsers = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Kết nối thất bại");
      // const data = await res.json();
      const data = await safeJson(res);
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách user:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // 🖼 Chọn ảnh — hỗ trợ cả web và mobile
  const pickImage = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event: any) => {
        const file = event.target.files?.[0];
        if (file) {
          const uri = URL.createObjectURL(file);
          setImageUri(uri);
          (file as any).isLocalFile = true;
          (window as any).selectedImageFile = file;
        }
      };
      input.click();
    } else {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setImageUri(result.assets[0].uri);
        }
      } catch (error) {
        console.error("Lỗi khi chọn ảnh:", error);
      }
    }
  };

  const clearForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setImageUri(null);
    setEditingId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!username || !email || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    if (Platform.OS === "web" && (window as any).selectedImageFile) {
      formData.append("image", (window as any).selectedImageFile);
    } else if (imageUri && Platform.OS !== "web") {
      const fileName = imageUri.split("/").pop() || "image.jpg";
      const fileType = fileName.split(".").pop();
      formData.append("image", {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);
    }

    try {
      const res = await fetch(
        editingId ? `${API_URL}/${editingId}` : `${API_URL}/add`,
        {
          method: editingId ? "PUT" : "POST",
          body: formData,
          headers: { Accept: "application/json" },
        }
      );

      // const data = await res.json();
      const data = await safeJson(res);

      if (res.ok) {
        Alert.alert(
          "✅ Thành công",
          editingId ? "Đã cập nhật người dùng" : "Đã thêm người dùng"
        );
        clearForm();
        loadUsers();
      } else {
        Alert.alert("Lỗi", data.error || "Không thể lưu người dùng");
      }
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ");
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user._id);
    setUsername(user.username);
    setEmail(user.email);
    setPassword(user.password || "");
    if (user.image) {
      setImageUri(
        user.image.startsWith("http")
          ? user.image
          : `http://${LOCALHOST}:4000${user.image}`
      );
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa người dùng này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            (async () => {
              try {
                const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
                if (res.ok) {
                  Alert.alert("✅ Xóa thành công");
                  loadUsers();
                } else {
                  Alert.alert("❌ Không thể xóa người dùng");
                }
              } catch (err) {
                console.error(err);
                Alert.alert("❌ Không thể kết nối đến máy chủ");
              }
            })();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ImageBackground
      source={require("@/assets/images/background.jpg")} 
      style={styles.background}
      imageStyle={{ opacity: 0.2 }} // mờ nhẹ
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Đăng xuất</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👑 Quản lý người dùng</Text>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity onPress={pickImage} style={styles.pickButton}>
          <Text style={styles.pickText}>🖼 Chọn ảnh</Text>
        </TouchableOpacity>

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 100, height: 100, borderRadius: 10, marginVertical: 10 }}
          />
        )}

        <Button
          title={editingId ? "Cập nhật người dùng" : "Thêm người dùng"}
          onPress={handleAddOrUpdate}
        />

        <Text style={styles.subtitle}>📋 Danh sách người dùng</Text>

        {users.map((u) => (
          <UserCard
            key={u._id}
            user={u}
            onEdit={() => handleEdit(u)}
            onDelete={() => handleDelete(u._id)}
          />
        ))}
      </ScrollView>
      
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  pickButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  pickText: { color: "#fff", fontWeight: "600" },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  logoutButton: {
    alignSelf: "flex-end",
    backgroundColor: "#dc3545",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
