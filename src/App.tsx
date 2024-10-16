import React, { useState, useEffect } from "react";
import { ICardData } from "./types";
import Overlay from "./components/overlay";
import Card from "./components/card";

const App = () => {
  const [cards, setCards] = useState<ICardData[]>([]);
  const [isImageOpen, setIsImageOpen] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [draggingCardIndex, setDraggingCardIndex] = useState<number | null>(null);
  const [timeSinceLastSave, setTimeSinceLastSave] = useState<number>(0);

  // Fetch cards from the API
  useEffect(() => {
    fetch("/api/cards")
      .then((response) => response.json())
      .then((data) => setCards(data))
      .catch((error) => console.error("Error fetching cards:", error));
  }, []);

  // Save to localStorage every 5 seconds if changes are made
  useEffect(() => {
    // Clear any existing timers
    const timer = setTimeout(() => {
      if (!isSaving) {
        saveCards(cards); // Save the cards only after 5 seconds of the last change
      }
    }, 5000); // Wait 5 seconds

    // Cleanup function to clear the timer when `cards` changes before the 5 seconds are up
    return () => clearTimeout(timer);
  }, [cards]);

  // Close the overlay on ESC key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsImageOpen(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Timer to update the "last saved X seconds ago"
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSinceLastSave(Math.floor((Date.now() - lastSaveTime) / 1000)); // Update every second
    }, 1000);

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, [lastSaveTime]); // Re-run only when `lastSaveTime` changes

  // Function to save cards via API
  const saveCards = (cards: ICardData[]) => {
    setIsSaving(true);
    fetch("/api/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cards),
    })
      .then((response) => response.json())
      .then(() => {
        setIsSaving(false);
        setLastSaveTime(Date.now());
      })
      .catch((error) => {
        console.error("Error saving cards:", error);
        setIsSaving(false);
      });
  };

  // Function to handle drag start
  const handleDragStart = (index: number) => {
    setDraggingCardIndex(index);
  };

  // Function to handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Prevent the default to allow for dropping
    if (draggingCardIndex === null || draggingCardIndex === index) return;

    const newCards = [...cards];
    const draggedCard = newCards.splice(draggingCardIndex, 1)[0];
    newCards.splice(index, 0, draggedCard);
    setCards(newCards);
    setDraggingCardIndex(index); // Update dragging index to new position
  };

  // Function to handle drag end
  const handleDragEnd = () => {
    setDraggingCardIndex(null); // Reset after drag is complete
  };

  return (
    <>
      <div className="grid-container">
        {cards.map((card, index) => (
          <Card
            key={card.type}
            card={card}
            draggingCardIndex={draggingCardIndex}
            index={index}
            handleDragStart={() => handleDragStart(index)}
            handleDragOver={(e) => handleDragOver(e, index)}
            handleDragEnd={handleDragEnd}
            handleClick={() => {
              setIsImageOpen(card.thumbnail);
            }}
          />
        ))}
      </div>
      {isImageOpen && <Overlay url={isImageOpen} handleClose={() => setIsImageOpen(null)} />}

      <div className="save-status">{isSaving ? <span>Saving...</span> : <span>Last saved {timeSinceLastSave} seconds ago</span>}</div>
    </>
  );
};

export default App;
