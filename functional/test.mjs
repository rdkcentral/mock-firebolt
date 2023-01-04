import * as utils from './tests/utilities.mjs';

const test = async () => {
  const x = await utils.mfEventListener(
    // JSON.stringify({
    //   method: "accessibility.onVoiceGuidanceSettingsChanged",
    //   params: {listen: true },
    //   id: 4,
    // })
    // JSON.stringify({
    //   method: "accessibility.closedCaptionsSettings",
    //   params: {},
    //   id: 0,
    // })
    JSON.stringify({
      method: "device.onNameChanged",
      params: { listen: true },
      id: 11,
    }),
    9998,
    "567~B",
  );
  console.log(x);
};

test();
