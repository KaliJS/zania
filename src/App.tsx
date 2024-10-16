import React, { useState, useEffect } from "react";
import { ICardData } from "./types";

// import { worker } from "./mocks/browser";

// worker.listen();

const App: React.FC = () => {
  const [cards, setCards] = useState<ICardData[]>([]);
  const [isImageOpen, setIsImageOpen] = useState<string | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [draggingCardIndex, setDraggingCardIndex] = useState<number | null>(null);

  // Fetch cards from the API
  useEffect(() => {
    fetch("/api/cards")
      .then((response) => response.json())
      .then((data) => setCards(data))
      .catch((error) => console.error("Error fetching cards:", error));
  }, []);

  // Save to localStorage every 5 seconds if changes are made
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastSaveTime >= 5000 && !isSaving) {
        saveCards(cards);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [cards, lastSaveTime]);

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
          <div
            key={card.type}
            className={`card ${draggingCardIndex === index ? "dragging" : ""}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            style={{ transform: `translateY(${draggingCardIndex === index ? "5px" : "0"})` }}
            onClick={() => {
              setIsImageOpen(card.thumbnail);
            }}
          >
            <img src={card.thumbnail} alt={card.title} />
            <h3>{card.title}</h3>
          </div>
        ))}
      </div>
      {isImageOpen && (
        <div className="overlay" onClick={() => setIsImageOpen(null)}>
          <img src={isImageOpen} alt="Selected" />
        </div>
      )}

      <div className="save-status">{isSaving ? <span>Saving...</span> : <span>Last saved {Math.floor((Date.now() - lastSaveTime) / 1000)} seconds ago</span>}</div>
    </>
  );
};

export default App;
