import  { contextBridge, ipcRenderer } from 'electron';
import { VALID_INVOKE_CHANNELS } from './definitions';

// see https://stackoverflow.com/a/59888788/1991697
contextBridge.exposeInMainWorld('api', {
	invoke: (chanel: string, data: any) => {
		// this typing-hell BS is an excellent example of typescript usage casing more troubles than benefits
		if (chanel in VALID_INVOKE_CHANNELS) {
			return ipcRenderer.invoke(chanel, data);
			}
		return Promise.reject('Invoke not allowed');
		}
	}
);
