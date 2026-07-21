export type Drill = {
  name: string;
  focus: string;
  desc: string;
};

export type StrokeContent = {
  slug: string;
  icon: string;
  name: string;
  desc: string;
  description: string;
  drills: Drill[];
};

export const strokes: StrokeContent[] = [
  {
    slug: "freestyle",
    icon: "🏊",
    name: "Freestyle",
    desc: "The fastest stroke. Master high-elbow catch, body rotation, and efficient kick to cut seconds off every lap.",
    description:
      "Freestyle is the fastest and most versatile stroke. Improving your catch, body rotation, and kick efficiency will pay dividends in every race distance, from the 50m sprint to open-water events.",
    drills: [
      {
        name: "Catch-Up Drill",
        focus: "Timing & extension",
        desc: "Keep one arm fully extended at the front until the recovering arm catches up before beginning the next pull. Builds patient timing and full reach.",
      },
      {
        name: "Fingertip Drag",
        focus: "High-elbow recovery",
        desc: "During arm recovery, drag your fingertips lightly along the water surface. Forces a high elbow position and a relaxed, efficient recovery.",
      },
      {
        name: "Fist Drill",
        focus: "Forearm feel",
        desc: "Swim with closed fists. Removes hand surface area so you learn to press water with your forearm, improving your catch and pull.",
      },
      {
        name: "Side Kick",
        focus: "Body rotation",
        desc: "Kick on your side with the lower arm extended and the upper arm at your hip. Trains the rotated body position used throughout the stroke.",
      },
      {
        name: "Single-Arm Freestyle",
        focus: "Pull mechanics",
        desc: "Swim using one arm only while the other rests at your side or extended front. Lets you focus entirely on the pull path of each arm.",
      },
      {
        name: "Tarzan Drill",
        focus: "Balance & awareness",
        desc: "Swim freestyle with your head raised above the water, eyes looking forward. Develops body balance and feel for your waterline.",
      },
    ],
  },
  {
    slug: "backstroke",
    icon: "🔄",
    name: "Backstroke",
    desc: "The only stroke swum on your back. Develop shoulder rotation, a steady kick, and a clean hand exit.",
    description:
      "Backstroke is the only stroke swum on your back, which creates unique challenges for balance and orientation. Developing a steady kick, strong shoulder rotation, and a clean hand exit will make you significantly more efficient in the water.",
    drills: [
      {
        name: "Single-Arm Backstroke",
        focus: "Pull mechanics",
        desc: "Swim with one arm pulling while the other rests at your side. Concentrate on a deep catch, straight pull path, and strong finish past the hip.",
      },
      {
        name: "Shoulder Roll Drill",
        focus: "Body rotation",
        desc: "Exaggerate shoulder rotation on every stroke, driving the pulling shoulder deep and the recovering shoulder high. Builds power and reduces drag.",
      },
      {
        name: "Backstroke Kick",
        focus: "Kick technique",
        desc: "Kick on your back with arms at your sides. Focus on keeping toes pointed, knees below the surface, and generating propulsion from the upkick.",
      },
      {
        name: "Thumb-Exit Drill",
        focus: "Hand exit",
        desc: "Consciously lead the hand out of the water with the thumb pointing up. Promotes a clean, lateral exit that sets up an efficient recovery.",
      },
      {
        name: "Fist Backstroke",
        focus: "Forearm catch",
        desc: "Swim backstroke with closed fists to remove hand surface area. Teaches you to engage your forearm during the catch for a stronger pull.",
      },
      {
        name: "Windmill Drill",
        focus: "Arm timing",
        desc: "Circle both arms continuously in a windmill motion out of the water before entering. Grooves the alternating rhythm and relaxed recovery path.",
      },
    ],
  },
  {
    slug: "breaststroke",
    icon: "🐸",
    name: "Breaststroke",
    desc: "The most technical stroke. Nail the pull-breathe-kick-glide timing to find rhythm and reduce drag.",
    description:
      "Breaststroke is the most technical of the four strokes. The pull-breathe-kick-glide cycle must be timed precisely — too much overlap creates drag, too long a glide loses momentum. Mastering the timing is what separates good breaststroke swimmers from great ones.",
    drills: [
      {
        name: "Pull Buoy Pull",
        focus: "Arm pull isolation",
        desc: "Use a pull buoy between your legs to eliminate the kick. Lets you focus entirely on the pull — outsweep, insweep, and forward extension.",
      },
      {
        name: "Kick on Back",
        focus: "Kick technique",
        desc: "Kick breaststroke while lying on your back, so you can look down and watch your feet. Check that heels come up narrow and feet flex outward on the drive.",
      },
      {
        name: "Two-Kicks One-Pull",
        focus: "Timing",
        desc: "Perform two kicks for every one arm pull. Exaggerates the glide phase and forces you to feel the momentum generated by the kick before pulling.",
      },
      {
        name: "Glide Extension",
        focus: "Reducing drag",
        desc: "After each stroke cycle, hold the streamlined glide position for a full count before beginning the next pull. Builds awareness of drag and momentum.",
      },
      {
        name: "Head-Up Breaststroke",
        focus: "Balance & sighting",
        desc: "Swim breaststroke with your head lifted above the waterline. Develops balance and is useful for open-water sighting skills.",
      },
      {
        name: "Undulation Drill",
        focus: "Body wave",
        desc: "Focus on an exaggerated head-dip and hip-rise during the stroke. The undulating body wave reduces frontal resistance and drives the kick.",
      },
    ],
  },
  {
    slug: "butterfly",
    icon: "🦋",
    name: "Butterfly",
    desc: "The most demanding stroke. Build a powerful dolphin kick, undulating body wave, and simultaneous arm pull.",
    description:
      "Butterfly is the most physically demanding stroke. The key is not raw power but rhythm — an undulating body wave, precise kick timing, and a relaxed recovery make butterfly sustainable and fast. These drills break the stroke into manageable pieces.",
    drills: [
      {
        name: "Single-Arm Butterfly",
        focus: "Pull mechanics",
        desc: "Swim butterfly using one arm at a time while the other rests extended at the front. Lets you focus on the catch, pull, and push of each arm independently.",
      },
      {
        name: "Two-Kick Focus",
        focus: "Kick timing",
        desc: "Exaggerate the two dolphin kicks per stroke cycle — one as the hands enter, one as they exit. Builds awareness of how kick timing drives the stroke.",
      },
      {
        name: "Dolphin Kick on Side",
        focus: "Underwater kick",
        desc: "Kick butterfly on your side with one arm extended. Isolates the dolphin kick and lets you feel the undulation from hips to feet.",
      },
      {
        name: "Catch Drill",
        focus: "High-elbow catch",
        desc: "At the front of each stroke, pause in the catch position with elbows high and hands angled down before pulling through. Builds feel for the early vertical forearm.",
      },
      {
        name: "Fly-Back",
        focus: "Arm timing",
        desc: "Swim butterfly arms with a backstroke kick instead of dolphin kick. Removes the most tiring element so you can focus entirely on arm timing and entry.",
      },
      {
        name: "Underwater Butterfly",
        focus: "Streamline & power",
        desc: "Push off the wall and perform full butterfly underwater with no breathing. Trains the undulating rhythm and is the foundation for powerful underwater phases.",
      },
    ],
  },
];

export function getStroke(slug: string): StrokeContent | undefined {
  return strokes.find((stroke) => stroke.slug === slug);
}
