import { ICardData } from "../../types";

interface Props {
  card: ICardData;
  draggingCardIndex: number | null;
  index: number;
  handleDragStart: () => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragEnd: () => void;
  handleClick: () => void;
}
const Card = ({ card, draggingCardIndex, index, handleDragStart, handleDragOver, handleDragEnd, handleClick }: Props) => {
  return (
    <div
      className={`card ${draggingCardIndex === index ? "dragging" : ""}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={(e) => handleDragOver(e)}
      onDragEnd={handleDragEnd}
      style={{ transform: `translateY(${draggingCardIndex === index ? "5px" : "0"})` }}
      onClick={() => {
        handleClick();
      }}
    >
      <img src={card.thumbnail} alt={card.title} />
      <h3>{card.title}</h3>
    </div>
  );
};

export default Card;
