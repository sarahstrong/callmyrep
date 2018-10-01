# My local representative
##Dialogflow fulfillment for Google Home

Finds your local representative's contact information on your Home device.

Try it by saying "Talk to my local representative" to your Google Home or Assistant

## Setup Instructions

1. [Create an action and Dialogflow agent.](https://developers.google.com/actions/dialogflow/project-agent)
1. [Restore Dialogflow agent](https://dialogflow.com/docs/best-practices/import-export-for-versions) from CallMyRep.zip
1. [Deploy via Firebase](https://developers.google.com/actions/dialogflow/deploy-fulfillment)
1. Update webhook URLs in Dialogflow agent to reflect your new Firebase server.
1. Enable billing in Google cloud console to allow for outbound network calls to the OpenNorth and Google Civic Information servers.
1. Test via simulator in Actions on Google console or your device.
