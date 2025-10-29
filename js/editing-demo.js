/*
Copyright 2025 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

import { SequenceSegment, VideoSequence, AudioSequence } from '../../../../editing';
import { fromURI } from '../../../../media.js';

const MS_TO_PIXELS = 1/100;
const avEdits = [
    { sourceIn: 60000, sourceOut: 65000, destinationIn: 5000 },
    { sourceIn: 30000, sourceOut: 45000, destinationIn: 4000 },
    { sourceIn: 66000, sourceOut: 70000, destinationIn: 25000 },
    { sourceIn: 100000, sourceOut: 120000, destinationIn: 35000 } ];

let dragging;

document.addEventListener('keyup', (e) => {
    if (e.key === 'r') {
        renderEdits(true);
    }
});

const player = document.body.querySelector('codec-player');
const sources = await fromURI('../../../sampleassets/bbb.mp4');
const mp3Source = await fromURI('../../../sampleassets/demo.mp3');
const imgSource = await fromURI('../../../sampleassets/logo.png');
const videoseq = new VideoSequence();
const audioseq = new AudioSequence();

const videoEdits = SequenceSegment.JSONtoSequenceSegments(avEdits, sources.video);
const audioEdits = SequenceSegment.JSONtoSequenceSegments(avEdits, sources.audio);
const musicTrack = new SequenceSegment(mp3Source.guid, 0,0, 40000, 0);
const logoOverlay = new SequenceSegment(imgSource.image.guid, 0, 0, 40000, 0);
logoOverlay.setRelativePosition(.5, .5);
logoOverlay.setRelativeSize(.2);

audioEdits.push(musicTrack);
videoEdits.push(logoOverlay);

videoseq.edits = videoEdits;
audioseq.edits = audioEdits;

renderUI();
refreshTrackInfo();
await renderEdits();

document.body.querySelector('#clips').addEventListener('pointerdown', (e) => {
    const hit = clipHitTest(e);
    if (hit) {
        const bounds = e.target.getBoundingClientRect();
        const containerBounds = e.currentTarget.getBoundingClientRect();
        let clickOffset;
        switch (hit) {
            case 'left-edge':
            case 'body':
                clickOffset = e.clientX - bounds.x;
                break;

            case 'right-edge':
                clickOffset = bounds.width - e.clientX + containerBounds.x;
                break;
        }

        const trackNum = [...e.currentTarget.children].indexOf(e.target);
        dragging = {
            target: e.target,
            container: e.currentTarget,
            containerMouseOffset: containerBounds.x,
            borderWidth: 6,
            type: hit,
            clickOffset,
            trackNum,
            originalX: bounds.x - containerBounds.x,
            originalWidth: bounds.width,
            originalSourceIn: videoEdits[trackNum].sourceIn
        };

        drag(e.clientX - dragging.containerMouseOffset);
    } else {
        dragging = undefined;
    }
});

document.body.addEventListener('pointerup', (e) => {
    if (dragging) {
        dragging.target.style.cursor = 'inherit';
        renderEdits();
    }
    dragging = undefined;
});

document.body.addEventListener('pointermove', (e) => {
    if (dragging) {
        drag(e.clientX - dragging.containerMouseOffset);
        refreshTrackInfo();
    } else {
        switch(clipHitTest(e)) {
            case 'left-edge':
            case 'right-edge':
                e.currentTarget.style.cursor = 'col-resize';
                break;

            case 'body':
                e.currentTarget.style.cursor = 'grab';
                break;

            default:
                e.currentTarget.style.cursor = 'inherit';
        }
    }
});

function drag(mouseX) {
    const trackNum = dragging.trackNum;
    switch (dragging.type) {
        case 'left-edge':
            const rightEdge = dragging.originalX + dragging.originalWidth;
            const leftEdge = Math.max(0, mouseX - dragging.clickOffset);
            dragging.target.style.left = leftEdge + 'px';
            dragging.target.style.width = (rightEdge - leftEdge - dragging.borderWidth * 2) + 'px';

            videoEdits[trackNum].destinationIn = leftEdge / MS_TO_PIXELS;
            videoEdits[trackNum].sourceIn = dragging.originalSourceIn + (leftEdge - dragging.originalX) / MS_TO_PIXELS;
            videoEdits[trackNum].sourceOut = videoEdits[trackNum].sourceIn + (rightEdge - leftEdge - dragging.borderWidth * 2) / MS_TO_PIXELS;
            audioEdits[trackNum].destinationIn = videoEdits[trackNum].destinationIn;
            audioEdits[trackNum].sourceIn = videoEdits[trackNum].sourceIn;
            audioEdits[trackNum].sourceOut = videoEdits[trackNum].sourceOut;
            break;

        case 'right-edge':
            dragging.target.style.width = (mouseX + dragging.clickOffset - dragging.borderWidth * 2) + 'px';
            videoEdits[trackNum].sourceOut = videoEdits[trackNum].sourceIn + (mouseX + dragging.clickOffset) / MS_TO_PIXELS;
            audioEdits[trackNum].sourceOut = videoEdits[trackNum].sourceOut;
            break;

        case 'body':
            dragging.target.style.left = Math.max(0, mouseX - dragging.clickOffset) + 'px';
            videoEdits[trackNum].destinationIn = Math.max(0, mouseX - dragging.clickOffset) / MS_TO_PIXELS;
            audioEdits[trackNum].destinationIn = videoEdits[trackNum].destinationIn;
            break;
    }
}

function clipHitTest(e) {
    if (e.target.classList.contains('clip')) {
        const bounds = e.target.getBoundingClientRect();
        if (e.clientX - bounds.x < 20) {
            return 'left-edge';
        } else if (bounds.x + bounds.width - e.clientX < 20) {
            return 'right-edge';
        } else {
            return 'body';
        }
    } else {
        return undefined;
    }
}

function refreshTrackInfo() {
    document.querySelectorAll('.track').forEach((track, index) => {
        if (videoEdits.length > index) {
            track.innerHTML = `<span>Dest in/out: ${videoEdits[index].destinationIn / 1000} / ${videoEdits[index].destinationOut / 1000}</span>
                                <span>Src in: ${videoEdits[index].sourceIn / 1000}</span>
                                <span>Src out: ${videoEdits[index].sourceOut / 1000}</span>`
        }
    });
}

async function renderEdits() {
    const startTIme = Date.now();
    videoseq.edits = videoEdits;
    audioseq.edits = audioEdits;
    const vout = await videoseq.render();
    const aout = await audioseq.render();
    player.stream = {
        video: { stream: vout },
        audio: {
            stream: aout,
            sampleRate: 44100
        },
        keepSameStartTime: true
    };
    console.log('Time from edit to player:', (Date.now() - startTIme)/1000);
}

function renderUI() {
    document.querySelectorAll('.clip').forEach((clip, index) => {
        // For the purposes of these demos, we're keeping video/audio edits the same, so we can use one of the other here
        if (videoEdits.length <= index) {
            clip.style.width = 0;
        } else {
            clip.style.left = videoEdits[index].destinationIn * MS_TO_PIXELS + 'px';
            clip.style.width = (videoEdits[index].sourceOut - videoEdits[index].sourceIn) * MS_TO_PIXELS + 'px';
        }
    });
}
