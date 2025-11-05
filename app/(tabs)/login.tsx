import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [name, setName] = useState(""); // dùng 'name' cho admin và username cho user
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  const handleLogin = async () => {
    const trimmedName = name.trim();
    const trimmedPassword = password;

    if (!trimmedName || !trimmedPassword) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);

    try {
      // ===== Login Admin =====
      const adminResponse = await fetch("http://172.20.10.3:4000/api/admins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, password: trimmedPassword }),
      });

      const adminData = await safeJson(adminResponse);

      if (adminResponse.ok) {
        Alert.alert("Đăng nhập thành công", adminData.message || "Chào mừng Admin!", [
          {
            text: "OK",
            onPress: () => router.replace("/admimScren"),
          },
        ]);
        return; // important: stop here if admin
      }

      // ===== Nếu không phải admin, thử login user =====
      const userResponse = await fetch("http://172.20.10.3:4000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedName, password: trimmedPassword }),
      });

      const userData = await safeJson(userResponse);

      if (userResponse.ok) {
        Alert.alert("Đăng nhập thành công", userData.message || "Chào mừng User!", [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/profile",
                params: { user: JSON.stringify(userData.user) },
              }),
          },
        ]);
        return;
      }

      // Nếu cả hai đều không ok, hiển thị thông báo lỗi hợp lý
      const errMsg =
        userData.message || adminData.message || "Sai thông tin đăng nhập admin và user";
      Alert.alert("Đăng nhập thất bại", errMsg);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Tên đăng nhập"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        title={loading ? "Đang đăng nhập..." : "Login"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 12 },
});