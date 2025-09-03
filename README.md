VoiceToTextPCF - Power Apps Component Framework Control
This repository contains a Power Apps Component Framework (PCF) control named VoiceToTextPCF, which enables speech-to-text functionality within Dynamics 365 CRM or Dataverse environments. The control allows users to capture voice input and convert it into text, which can be bound to a field in a canvas or model-driven app.
Overview

Purpose: Provides a reusable PCF control to record voice input and transcribe it into text for CRM applications.
Features:
Real-time speech recognition with interim and final transcriptions.
Dynamic button states ("Start Speaking", "Listening...", "Browser Not Supported").
Integration with Dataverse bound fields.
Accessible design with ARIA labels.


Technology Stack:
TypeScript for the control logic.
CSS for styling.
Power Apps CLI for development and deployment.



Prerequisites

Node.js: Version 14.x or later (install via nodejs.org).
Power Apps CLI: Install using npm install -g @microsoft/powerapps-cli and authenticate with pac auth create.
Visual Studio Code or another code editor (recommended).
Dataverse Environment: Access to a Dynamics 365 CRM or Power Apps environment with appropriate permissions (e.g., System Administrator or System Customizer).
Microphone: Functional microphone for speech input, with browser permissions enabled.

Installation

Clone the Repository:
git clone https://github.com/yourusername/VoiceToTextPCF.git
cd VoiceToTextPCF


Install Dependencies:
npm install


Initialize the Solution:

Run the following command to set up the solution with your publisher details:pac solution init --publisher-name "SpeechToTextdev" --publisher-prefix pcfde


Add the PCF project reference:pac solution add-reference --path .




Build the Project:
msbuild /t:restore
msbuild


This generates a .zip file (e.g., VoiceToTextPCF_1_0_0_0.zip) in the bin/debug folder.



Deployment

Import the Solution:

Use the Power Apps CLI to import the solution into your Dataverse environment:pac solution import --path bin\debug\VoiceToTextPCF_1_0_0_0.zip --environment <EnvironmentIdOrName>


Replace <EnvironmentIdOrName> with your environment ID (find it with pac env list).
Alternatively, import via the Power Apps Maker Portal:
Go to https://make.powerapps.com, select your environment, and use Solutions > Import solution.




Publish Customizations:
pac solution publish


Or publish manually in the Maker Portal after importing.


Add to App:

For model-driven apps, add the control to a form via the Power Apps Maker Portal.
For canvas apps, add it in Power Apps Studio and bind the controlValue property.
Publish the app to make it live.



Usage

In-App Behavior:
Click "Start Speaking" to begin recording (requires microphone permission).
The button changes to "Listening..." during recording.
Transcribed text appears in the textarea in real-time (interim) and finalizes when stopped.
Click "Listening..." to stop and save the final transcript to the bound field.


Browser Support: Works best in Chrome; other browsers may show "Browser Not Supported" if the Web Speech API is unavailable.

Testing

Run locally with:npm run start


Open the provided URL (e.g., http://localhost:8181) and test the control.
Check the browser console (F12) for errors (e.g., "not-allowed" for permission issues).

Known Issues

Microphone Permission: Ensure permissions are granted, or an error will occur.
Browser Compatibility: Limited to browsers supporting the Web Speech API (e.g., Chrome, Edge).
Debugging: Use console logs in index.ts to troubleshoot recording failures.

Contributing

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make changes and commit (git commit -m "Describe changes").
Push to the branch (git push origin feature-branch).
Open a pull request.

License
[Specify your license here, e.g., MIT] - Default is no license unless stated.
Contact

Author: Advic Tech
Email: developer@advic.io
Issues: Report bugs or suggestions on the GitHub Issues page.
