import Cookie from "universal-cookie";

export const getTokenOrRefresh = async () => {
    const cookie = new Cookie();
    const speechToken = cookie.get('speech-token');
    const speechKey = process.env.REACT_APP_SPEECH_KEY;
    const speechRegion = process.env.REACT_APP_SPEECH_REGION;   

    let tokenResponse;
    
    if( !speechToken ){
        if (speechKey === 'paste-your-speech-key-here' || speechRegion === 'paste-your-speech-region-here') {
            tokenResponse = {
                authToken: null,
                error: 'You forgot to add your speech key or region to the .env file'
            };
        } else {
            const headers = {
                'Ocp-Apim-Subscription-Key': speechKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            await fetch(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
                method: "post",
                headers
            }).then( response => {
                if(response.ok) {
                    return response.text().then(data => {
                        //console.log('Token fetched from API', data);
                        cookie.set('speech-token', speechRegion + ':' + data, {maxAge: 540, path: '/'});
                        tokenResponse = {
                            authToken: data,
                            region: speechRegion
                        };
                    });    
                } else {
                    tokenResponse = {
                        authToken: null,
                        error: "Network reponse OK but HTTP response not OK"
                    };
                }
            }).catch(err => {
                tokenResponse = {
                    authToken: null,
                    error: err
                };
            });

            return tokenResponse;
        }        
    } else {
        //console.log('Token fetched from cookie', speechToken);
        const idx = speechToken.indexOf(":");
        return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
    }
}