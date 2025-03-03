import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  Linking,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import CustomHeader from "../../../components/CustomHeader";
import colors from "../../../utils/colors";
import firestore from "@react-native-firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function Training() {
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        const trainingSnapshot = await firestore().collection("training").get();

        const trainings = trainingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Training data:", trainings);
        setTrainingData(trainings);
      } catch (err) {
        console.error("Error fetching training data:", err);
        setError("Unable to load training videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, []);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;

    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const openLink = (item) => {
    const url = item.videoUrl || item.url;
    const videoId = getYouTubeVideoId(url);

    if (videoId) {
      setPlayingVideo({
        id: videoId,
        title: item.title,
      });
    } else {
      Linking.openURL(url).catch(() => {
        console.log("Don't know how to open URI: " + url);
      });
    }
  };

  const renderItem = ({ item }) => (
    <Pressable style={styles.itemContainer} onPress={() => openLink(item)}>
      <View>
        <Image
          source={{ uri: item.thumbnail || item.image }}
          style={styles.itemImage}
        />
        {getYouTubeVideoId(item.videoUrl || item.url) && (
          <View style={styles.playIconContainer}>
            <Ionicons name="play-circle" size={60} color="white" />
          </View>
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={5}>
          {item.description}
        </Text>
      </View>
    </Pressable>
  );

  const videoPlayerModal = (
    <Modal
      visible={playingVideo !== null}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setPlayingVideo(null)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {playingVideo?.title}
            </Text>
            <Pressable
              onPress={() => setPlayingVideo(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.black} />
            </Pressable>
          </View>

          {playingVideo && (
            <YoutubePlayer
              height={220}
              videoId={playingVideo.id}
              play={true}
              onChangeState={(state) => {
                if (state === "ended") {
                  setPlayingVideo(null);
                }
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <>
        <CustomHeader title="Training" />
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CustomHeader title="Training" />
        <View style={[styles.container, styles.centered]}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchTrainingData();
            }}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <CustomHeader title="Training" />
      <View style={styles.container}>
        <FlatList
          data={trainingData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      </View>
      {videoPlayerModal}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  list: {
    paddingVertical: 10,
    padding: 16,
  },
  itemContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: 200,
  },
  textContainer: {
    padding: 10,
    backgroundColor: colors.white,
  },
  itemTitle: {
    fontSize: 20,
    color: colors.black,
    marginBottom: 4,
    fontFamily: "AptosBold",
  },
  itemDescription: {
    fontSize: 16,
    color: colors.darkgray,
    fontFamily: "Aptos",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "AptosSemiBold",
    fontSize: 16,
    color: colors.darkgray,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontFamily: "AptosBold",
    fontSize: 16,
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: Dimensions.get("window").width - 10,
    backgroundColor: colors.white,
    borderRadius: 5,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "AptosBold",
    color: colors.black,
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
});
