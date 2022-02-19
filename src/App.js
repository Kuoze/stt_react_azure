import React, { useState } from 'react';
import { getTokenOrRefresh } from './helpers/token_utils';
import { ResultReason, PronunciationAssessmentConfig } from 'microsoft-cognitiveservices-speech-sdk';
import { Container } from 'reactstrap';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

export const App = () => {

  const [msg, setMsg] = useState('INITIALIZED: ready to speech...');

  const sttFromMic = async () => {
    const tokenRes = await getTokenOrRefresh();
    console.log(tokenRes);

    if (tokenRes.authToken === null) {
      setMsg(`FATAL_ERROR: ${tokenRes.error}`);
    } else {
      const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenRes.authToken, tokenRes.region);
      speechConfig.speechRecognitionLanguage = 'en-US';

      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

      const pronunciationAssesmentConfig = new PronunciationAssessmentConfig('Hello darling, how are you?',
        speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
        speechsdk.PronunciationAssessmentGranularity.Phoneme, true);

      pronunciationAssesmentConfig.applyTo(recognizer);

      setMsg('Speack into your microphone...');

      recognizer.recognizeOnceAsync(result => {
        let displayText;
        if (result.reason === ResultReason.RecognizedSpeech) {
          var pronunciationAssessmentResult = speechsdk.PronunciationAssessmentResult.fromResult(result);
          var pronunciationScore = pronunciationAssessmentResult.pronunciationScore;
          var wordLevelResult = pronunciationAssessmentResult.detailResult.Words;

          console.log(pronunciationScore);
          console.log(wordLevelResult);
          displayText = `RECOGNIZED: Text=${result.text}`
        } else {
          displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
        }

        setMsg(displayText);
      });
    }
  }

  return (
    <Container className="app-container">
      <h1 className="display-4 mb-3">Speech sample app</h1>

      <div className="row main-container">
        <div className="col-6">
          <i className="fas fa-microphone fa-lg me-2" onClick={() => sttFromMic()}></i>
          Convert speech to text from your mic.         
        </div>
        <div className="col-6 output-display rounded">
          <code>{msg}</code>
        </div>
      </div>
    </Container>
  )
}