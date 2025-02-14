import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Searchbar, DefaultTheme } from "react-native-paper";
import colors from "../../../utils/colors";

const chatData = [
  {
    id: "1",
    name: "Happy Tails Animal Rescue",
    message: "Hi, of course. You can come dire...",
    time: "09:41",
    avatar: "https://placehold.co/50/png",
    unread: 1,
  },
  {
    id: "2",
    name: "City Critters Adoption Center",
    message: "Haha, yes I've seen your profile, it's very interesting",
    time: "08:25",
    avatar: "https://placehold.co/50/png",
    unread: 3,
  },
  {
    id: "3",
    name: "Purr Haven Shelter",
    message: "Wow, this is really epic 👍",
    time: "Yesterday",
    avatar: "https://placehold.co/50/png",
    unread: 2,
  },
  {
    id: "4",
    name: "Metro Paws Animal Sanctuary Big Big Name And Text",
    message: "Wow love it! ❤️",
    time: "Dec 21, 20...",
    avatar: "https://placehold.co/50/png",
    unread: 0,
  },

  {
    id: "5",
    name: "New Chat Example",
    message: "This is a new chat message.",
    time: "Just now",
    avatar: "https://placehold.co/50/png",
    unread: 1,
  },
];

export default function Chat() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query) => setSearchQuery(query);

  const filteredChats = chatData.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.chatItem}
      onPress={() =>
        router.push({
          pathname: `tabs/chat/${item.id}`,
          params: { chat: JSON.stringify(item) },
        })
      }
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <View style={styles.chatMessage}>
          <Text style={styles.chatText} numberOfLines={1}>
            {item.message}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Messages</Text>
      <Searchbar
        placeholder="Search"
        style={styles.searchBar}
        onChangeText={onChangeSearch}
        value={searchQuery}
        theme={{
          ...DefaultTheme,
          colors: { primary: colors.accent },
        }}
      />
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 26,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: "AptosDisplayBold",
  },
  searchBar: {
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: colors.offwhite,
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatName: {
    fontSize: 16,
    maxWidth: "75%",
    fontFamily: "AptosBold",
  },
  chatTime: {
    fontSize: 12,
    color: colors.darkgray,
  },
  chatMessage: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chatText: {
    fontSize: 14,
    color: colors.darkgray,
    maxWidth: "85%",
  },
  unreadBadge: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
});
