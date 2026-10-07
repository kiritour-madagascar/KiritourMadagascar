import React, { useEffect } from "react";
import ImagesGallery from "../components/Gallery/Gallery";

const About = () => {
  useEffect(() => {
    const title =
      "About KiriTour Madagascar | Local Travel Experts in Morondava";

    const description =
      "Discover KiriTour Madagascar through our travel gallery. Local travel experts based in Morondava, specialising in Baobabs, Tsingy, Kirindy and Madagascar wildlife.";

    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://kiritourmadagascar.com/about";
  }, []);

  return (
    <section>
      {/* {Gallery Section Start} */}
      <section className="py-8 text-center px-6 md:px-12">
        <h1 className="text-[40px] font-bold">
          Our <span className="text-BaseColor">Gallery</span>
        </h1>

        <p className="text-lg leading-8 mb-8 text-gray-800">
          "Unveil travel wonders in our gallery, a snapshot of TripsTravel's
          adventures."
        </p>

        <ImagesGallery />
      </section>
      {/* {Gallery Section Ends} */}
    </section>
  );
};

export default About;