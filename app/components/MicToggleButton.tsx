import React, { useState, useCallback } from "react";
import { Role } from "ultravox-client";
import { toggleMute } from "@/lib/callFunctions";
import { MicIcon, MicOffIcon, Volume2Icon, VolumeOffIcon } from "lucide-react";

interface MicToggleButtonProps {
  role: Role;
}

const MicToggleButton: React.FC<MicToggleButtonProps> = ({ role }) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMic = useCallback(async () => {
    try {
      toggleMute(role);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling microphone");
    }
  }, [isMuted]);

  return (
    <button
      onClick={toggleMic}
      className="size-[60px] bg-slate-600 hover:opacity-80 transition-all duration-150 rounded-full text-white grid place-items-center"
    >
      {isMuted ? (
        <>
          {role === Role.USER ? (
            <MicOffIcon width={24} className="brightness-0 invert" />
          ) : (
            <VolumeOffIcon width={24} className="brightness-0 invert" />
          )}
          {/* <span className="ml-2">Unmute</span> */}
        </>
      ) : (
        <>
          {role === Role.USER ? (
            <MicIcon width={24} className="brightness-0 invert" />
          ) : (
            <Volume2Icon width={24} className="brightness-0 invert" />
          )}

          {/* <span className="ml-2">Mute</span> */}
        </>
      )}
    </button>
  );
};

export default MicToggleButton;
