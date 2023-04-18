import { Spinner } from "@chakra-ui/spinner";
import { MarkerPlayerProps } from "../../datatypes/props";


const MarkerControls = (props: MarkerPlayerProps) => {
  const { audioLink, newAudio, handlePlayPause, isPlaying } = props;

  return (
    <>
      <div className="marker-player-controls">
        {audioLink && newAudio && (
          <button
            className="play-pause media-buttons"
            onClick={handlePlayPause}
          >
            {!isPlaying ? (
              <img src="./play.svg" alt="play-button"></img>
            ) : (
              <img src="./pause.svg" alt="play-button"></img>
            )}
          </button>
        )}
        {!newAudio && <Spinner size="md" />}
        {!audioLink && newAudio && (
          <button className="play-pause media-buttons disabled" disabled>
            <img src="./link-slash.svg" alt="play-button"></img>
          </button>
        )}
      </div>
    </>
  );
};

export default MarkerControls;
