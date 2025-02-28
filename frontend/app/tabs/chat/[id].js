import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  Composer,
} from "react-native-gifted-chat";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import { useBottomSheet } from "../../../contexts/BottomSheetContext";
import colors from "../../../utils/colors";

const ChatScreen = () => {
  const router = useRouter();
  const { ownerId } = useLocalSearchParams();
  const [ownerData, setOwnerData] = useState({});
  const [messages, setMessages] = useState([]);
  const { setIsBottomSheetOpen } = useBottomSheet();

  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged((currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      const unsubscribeUser = firestore()
        .collection("users")
        .doc(currentUser.uid)
        .onSnapshot((doc) => {
          console.log("Current user's data: ", doc.data());
          setUserData(doc.data());
        });
      return unsubscribeUser;
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    console.log("Owner Data:", ownerData);
  }, [ownerData]);

  useEffect(() => {
    if (!ownerId) return;

    const unsubscribe = firestore()
      .collection("users")
      .doc(ownerId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            console.log("Owner data fetched from Firestore:", doc.data());
            setOwnerData(doc.data() || {});
          } else {
            console.error("Owner document doesn't exist");
            setOwnerData({});
          }
        },
        (error) => {
          console.error("Error fetching owner data:", error);
        }
      );

    return () => unsubscribe();
  }, [ownerId]);

  const chatId = useMemo(() => {
    console.log("Owner data: ", ownerData);
    if (!user || !ownerId) return null;
    const id = [user.uid, ownerId].sort().join("_");
    console.log("Computed chatId:", id);
    return id;
  }, [user, ownerId]);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = firestore()
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot((querySnapshot) => {
        const messagesFirestore = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messagesFirestore.push({
            _id: doc.id,
            text: data.text,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            user: data.user,
          });
        });
        setMessages(messagesFirestore);
      });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !user || !userData) return;

    const markAsRead = async () => {
      try {
        await firestore()
          .collection("recentChats")
          .doc(chatId)
          .set(
            {
              [`participants.${user.uid}`]: {
                unread: 0,
              },
            },
            { merge: true }
          );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    markAsRead();
  }, [chatId, user, userData]);

  const onSend = useCallback(
    (newMessages = []) => {
      if (!chatId || !user) {
        console.error("Missing chatId or user", { chatId, user });
        return;
      }
      newMessages.forEach(async (msg) => {
        console.log("Sending message:", msg);
        try {
          await firestore()
            .collection("chats")
            .doc(chatId)
            .collection("messages")
            .add({
              text: msg.text,
              createdAt: firestore.FieldValue.serverTimestamp(),
              user: {
                _id: user.uid,
                name: user.displayName || "You",
              },
            });
          console.log("Message sent successfully.");
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, msg)
          );

          await firestore()
            .collection("recentChats")
            .doc(chatId)
            .set(
              {
                chatId,
                participantIds: [user.uid, ownerId].sort(),
                lastMessage: msg.text,
                lastMessageTime: firestore.FieldValue.serverTimestamp(),
                [`participants.${user.uid}`]: {
                  name: `${userData.firstname} ${userData.lastname}`,
                  avatar: userData.pfpUrl,
                  unread: 0,
                },
                [`participants.${ownerId}`]: {
                  name: `${ownerData.firstname} ${ownerData.lastname}`,
                  avatar: ownerData.pfpUrl,
                  unread: firestore.FieldValue.increment(1),
                },
              },
              { merge: true }
            );
        } catch (error) {
          console.error("Error sending message:", error);
        }
      });
    },
    [chatId, user, userData, ownerData, ownerId]
  );

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: colors.accent,
          alignSelf: "flex-end",
        },
        left: {
          backgroundColor: colors.lightwhite,
          alignSelf: "flex-start",
        },
      }}
      textStyle={{
        right: { color: colors.white, fontFamily: "Aptos" },
        left: { color: colors.black, fontFamily: "Aptos" },
      }}
    />
  );

  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={styles.inputToolbarContainer}
      primaryStyle={styles.inputToolbarPrimary}
    />
  );

  const renderComposer = (props) => (
    <Composer
      {...props}
      textInputStyle={[styles.composerTextInput, props.textInputStyle]}
    />
  );

  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendingContainer}>
        <Ionicons name="send" size={24} color={colors.white} />
      </View>
    </Send>
  );

  const renderAvatar = (props) => {
    const { currentMessage } = props;

    if (currentMessage.user._id === ownerId) {
      return (
        <Image
          source={{ uri: ownerData.pfpUrl || "https://placehold.co/30/png" }}
          style={{ width: 36, height: 36, borderRadius: 18 }}
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={colors.black}
          />
        </Pressable>
        <Image source={{ uri: ownerData.pfpUrl }} style={styles.avatar} />
        <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
          {`${ownerData.firstname} ${ownerData.lastname}`}
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: user?.uid || 1, name: user?.displayName || "You" }}
        renderUsernameOnMessage={false}
        showUserAvatar={false}
        showAvatarForEveryMessage={false}
        renderAvatar={renderAvatar}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightgray,
  },
  backButton: {
    marginRight: 5,
    padding: 5,
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    fontFamily: "UbuntuMedium",
    textAlign: "left",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  rightPlaceholder: {
    width: 34,
  },
  inputToolbarContainer: {
    borderTopColor: colors.lightgray,
    backgroundColor: colors.white,
    paddingRight: 6,
  },
  inputToolbarPrimary: {
    alignItems: "center",
    paddingVertical: 4,
  },

  composerTextInput: {
    borderRadius: 20,
    backgroundColor: colors.lightwhite,
    paddingHorizontal: 12,
    marginRight: 5,
  },
  sendingContainer: {
    backgroundColor: colors.accent,
    borderRadius: 22,
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
});
