import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Carousel from "react-native-reanimated-carousel";

import colors from "../../utils/colors";
import MainButton from "../../components/MainButton";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    title: "Rehome Your Pet",
    description: "Rehome your pets with ease and find loving homes.",
    image: require("../../assets/stay-home.png"),
  },
  {
    title: "Find Your Perfect Match",
    description: "Explore pets nearby and find your perfect companion.",
    image: require("../../assets/dog-house.png"),
  },
  {
    title: "Everything Your Pet Needs",
    description: "From toys to beds, collars to treats - all in one place.",
    image: require("../../assets/accessories.png"),
  },
  {
    title: "Get Started Today",
    description: "Sign up now and make a difference in a pet's life!",
    image: require("../../assets/pet.png"),
  },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      carouselRef.current.scrollTo({ index: currentSlide + 1, animated: true });
    } else {
      router.replace("/auth/sign-up");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.carouselWrapper}>
        <Carousel
          ref={carouselRef}
          width={width}
          height={height * 0.6}
          data={slides}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image source={item.image} style={styles.image} />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
          onSnapToItem={(index) => setCurrentSlide(index)}
          pagingEnabled
          snapEnabled
          loop={false}
          autoplay={false}
          scrollEnabled={false}
        />
      </View>

      <MainButton
        title={currentSlide < slides.length - 1 ? "Next" : "Sign Up"}
        onPress={handleNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  carouselWrapper: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    paddingTop: "15%",
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: "70%",
    resizeMode: "center",
    marginBottom: -50,
  },
  title: {
    fontSize: 24,
    color: colors.black,
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "UbuntuBold",
  },
  description: {
    fontSize: 16,
    color: colors.darkgray,
    textAlign: "center",
    paddingHorizontal: 10,
    fontFamily: "UbuntuMedium",
  },
});
