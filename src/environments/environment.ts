import { sasToken } from './environment.hidden';

/* INFO
'./environment.hidden' is git ignored and and looks like
export const sasToken = '<SAStoken>';

You will need to create the file and generate and include your own SAS token
*/

export const environment = {
  production: false,
  sasGeneratorUrl: 'https://localhost:5001',
  devSasToken: sasToken
};
