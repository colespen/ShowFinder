import { Spinner } from "@chakra-ui/spinner";
import { handlePlayPause } from "../../helpers/eventHandlers";
import { MarkerPlayerProps } from "../../datatypes/props";

const MarkerControls = (props: MarkerPlayerProps) => {
  const { audioLink, newAudio, isPlaying, audioRef } = props;

  return (
    <>
      <div className="marker-player-controls">
        {audioLink && newAudio && (
          <button
            className="play-pause media-buttons"
            onClick={()=>handlePlayPause(audioLink, isPlaying, audioRef)}
          >
            {!isPlaying ? (
              <img src="./play.svg" alt="play button"></img>
            ) : (
              <img src="./pause.svg" alt="pause button"></img>
            )}
          </button>
        )}
        {!newAudio && <Spinner size="md" />}
        {!audioLink && newAudio && (
          <button className="play-pause media-buttons disabled" disabled>
            <img src="./link-slash.svg" alt="no link"></img>
          </button>
        )}
      </div>
    </>
  );
};

export default MarkerControls;
