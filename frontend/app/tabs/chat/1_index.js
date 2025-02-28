import React, { useState, useEffect } from "react";
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
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import colors from "../../../utils/colors";

export default function Chat() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentChats, setRecentChats] = useState([]);

  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection("recentChats")
      .where("participantIds", "array-contains", currentUser.uid)
      .orderBy("lastMessageTime", "desc")
      .onSnapshot(
        (snapshot) => {
          const chats = [];
          if (snapshot) {
            snapshot.forEach((doc) => {
              const data = doc.data();

              // Reconstruct participants object manually
              const participants = Object.keys(data)
                .filter((key) => key.startsWith("participants."))
                .reduce((acc, key) => {
                  const userId = key.split(".")[1]; // Extract user ID
                  acc[userId] = data[key]; // Assign participant data
                  return acc;
                }, {});

              chats.push({
                id: doc.id,
                ...data,
                participants,
              });
            });
          }
          console.log("Fetched document:", JSON.stringify(chats, null, 2));
          setRecentChats(chats);
        },
        (error) => {
          console.error("Error fetching recent chats:", error);
        }
      );

    return () => unsubscribe();
  }, [currentUser]);

  const onChangeSearch = (query) => setSearchQuery(query);

  const filteredChats = recentChats.filter((chat) => {
    if (!chat.participantIds || !chat.participants) return false;

    const otherParticipantId = chat.participantIds.find(
      (id) => id !== currentUser.uid
    );

    if (!otherParticipantId) return false;

    const otherParticipant = chat.participants[otherParticipantId];

    if (!otherParticipant || !otherParticipant.name) return false;

    return otherParticipant.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });
  const renderItem = ({ item }) => {
    console.log("Rendering item:", item);
    console.log("participantIds:", item.participantIds);

    const otherParticipantId = item.participantIds?.find(
      (id) => id !== currentUser.uid
    );

    console.log("My ID: ", currentUser.uid);
    console.log("Other participant's ID: ", otherParticipantId);

    const otherParticipant = item.participants?.[otherParticipantId] || {};
    console.log("Other participant data:", otherParticipant);

    const myParticipantInfo = item.participants?.[currentUser.uid] || {};
    console.log("My info: ", myParticipantInfo);

    return (
      <Pressable
        style={styles.chatItem}
        onPress={() =>
          router.push({
            pathname: `tabs/chat/${item.chatId}`,
            params: { ownerId: otherParticipantId },
          })
        }
      >
        <Image
          source={{
            uri: otherParticipant.avatar || "https://placehold.co/50/png",
          }}
          style={styles.avatar}
        />
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {otherParticipant.name || "Unknown"}
            </Text>
            <Text style={styles.chatTime}>
              {item.lastMessageTime
                ? new Date(item.lastMessageTime.toDate()).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : ""}
            </Text>
          </View>
          <View style={styles.chatMessage}>
            <Text style={styles.chatText} numberOfLines={1}>
              {item.lastMessage || ""}
            </Text>
            {myParticipantInfo.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {myParticipantInfo.unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

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
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No recent messages</Text>
        }
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
  emptyListText: {
    color: colors.lightgray,
    fontFamily: "AptosSemiBold",
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center",
  },
});
