import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

// Quality Selector Plugins
import 'videojs-contrib-quality-levels';
import 'videojs-http-source-selector';

interface VideoPlayerProps {
    options: any;
    onReady?: (player: any) => void;
}

export default function VideoPlayer({ options, onReady }: VideoPlayerProps) {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
            const videoElement = document.createElement("video-js");

            videoElement.classList.add('vjs-big-play-centered');
            videoRef.current?.appendChild(videoElement);

            const player = playerRef.current = videojs(videoElement, {
                ...options,
                html5: {
                    vhs: {
                        overrideNative: true // This is the secret sauce for Safari quality selection
                    },
                    nativeAudioTracks: false,
                    nativeVideoTracks: false
                }
            }, () => {
                console.log('Video Player is ready');

                // Initialize the source selector plugin
                try {
                    if (typeof player.httpSourceSelector === 'function') {
                        player.httpSourceSelector();
                    }
                } catch (e) {
                    console.warn('Plugin init failed, falling back to manual detection');
                }

                onReady && onReady(player);
            });

            // Handle quality levels manually and log them
            player.on('loadedmetadata', () => {
                const qualityLevels = player.qualityLevels();
                console.log('Detected Quality Levels:', qualityLevels.length);

                // Log individual levels for debugging
                for (let i = 0; i < qualityLevels.length; i++) {
                    const level = qualityLevels[i];
                    console.log(`Resolution ${i}: ${level.height}p`);
                }

                qualityLevels.on('change', () => {
                    const selected = qualityLevels[qualityLevels.selectedIndex];
                    console.log('Currently Playing:', selected ? selected.height + 'p' : 'Auto');
                });
            });

            // You could update an existing player in the `else` block here
            // on prop change, for example:
        } else {
            const player = playerRef.current;
            player.autoplay(options.autoplay);
            player.src(options.sources);
        }
    }, [options, videoRef]);

    // Dispose the player on unmount
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    return (
        <div data-vjs-player>
            <div ref={videoRef} />
        </div>
    );
}


