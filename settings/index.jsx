function mySettings(props) {
  const vibrationIntensity = props.settingsStorage.getItem("vibrationIntensity") || "1";

  // function handleChange(value) {
  //   console.log(value);
  //   props.settingsStorage.setItem("vibrationIntensity", value);
  // }

  return (
    <Page>
      <Section
        title={<Text bold align="center">Vibration Intensity</Text>}
        description="Select the vibration intensity for REM detection"
      >
        <Select
          label="Vibration Intensity"
          settingsKey="vibrationIntensity"
          options={[
            { value: "1", name: "Max" },
            { value: "2", name: "Medium" },
            { value: "3", name: "Low" },
          ]}
          //value={vibrationIntensity}
          //onClick={handleChange(vibrationIntensity)}
        />
      </Section>
      <Section
        title={<Text bold align="center">Fitbit Account</Text>}>
        <Oauth
          settingsKey="oauth"
          title="Login"
          label="Fitbit"
          status="Login"
          authorizeUrl="https://www.fitbit.com/oauth2/authorize"
          requestTokenUrl="https://api.fitbit.com/oauth2/token"
          clientId="23QZHC"
          clientSecret="e0a7efe98688e84c183985c91c4d6e71"
          scope="sleep"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);


