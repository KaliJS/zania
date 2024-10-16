interface Props {
  url: string;
  handleClose: () => void;
}
const Overlay = ({ url, handleClose }: Props) => {
  return (
    <div className="overlay" onClick={() => handleClose()}>
      <img src={url} alt="Selected" />
    </div>
  );
};

export default Overlay;
