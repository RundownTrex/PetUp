import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
  Composer,
} from "react-native-gifted-chat";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../../utils/colors";

const ChatScreen = () => {
  const router = useRouter();
  const { chat } = useLocalSearchParams();
  const chatInfo = useMemo(() => (chat ? JSON.parse(chat) : {}), [chat]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log(chatInfo);
  }, [chatInfo]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: `Welcome to ${chatInfo.name}'s chat!`,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: chatInfo.name,
          avatar: chatInfo.avatar,
        },
      },
      {
        _id: 2,
        text: "Hello! How can we help you today?",
        createdAt: new Date(),
        user: {
          _id: 3,
          name: chatInfo.name,
          avatar: "https://placehold.co/50/png",
        },
      },
    ]);
  }, [chatInfo]);

  const onSend = useCallback((newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  }, []);

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: { backgroundColor: colors.accent },
        left: { backgroundColor: colors.lightwhite },
      }}
      textStyle={{
        right: { color: colors.white },
        left: { color: colors.black },
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={colors.black}
          />
        </TouchableOpacity>
        <Image source={{ uri: chatInfo.avatar }} style={styles.avatar} />
        <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
          {chatInfo.name}
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1, name: "You" }}
        renderUsernameOnMessage={false}
        showUserAvatar={true}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderComposer={renderComposer}
        renderSend={renderSend}
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
