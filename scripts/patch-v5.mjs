import fs from 'node:fs/promises';
const path='app-v5.js';let s=await fs.readFile(path,'utf8');let changed=0;
const oldChange='function changeSetting(){if(!isHost)return;const id=U.modeSelect.value;if(id!==S.settings.modeId){const max=+U.maxPlayers.value||8;S.settings={...settingsFor(id),maxPlayers:max}}S.settings.optionCount=[4,6,8].includes(+U.choiceSelect.value)?+U.choiceSelect.value:S.settings.optionCount;S.settings.maxPlayers=Math.max(2,Math.min(8,+U.maxPlayers.value||8));S.settings.content=["player","manager","mixed"].includes(U.contentSelect.value)?U.contentSelect.value:S.settings.content;sync()}';
const newChange='function changeSetting(e){if(!isHost)return;const id=U.modeSelect.value;if(id!==S.settings.modeId){const max=+U.maxPlayers.value||8;S.settings={...settingsFor(id),maxPlayers:max};U.choiceSelect.value=String(S.settings.optionCount);U.contentSelect.value=S.settings.content}else{S.settings.optionCount=[4,6,8].includes(+U.choiceSelect.value)?+U.choiceSelect.value:S.settings.optionCount;S.settings.content=["player","manager","mixed"].includes(U.contentSelect.value)?U.contentSelect.value:S.settings.content}S.settings.maxPlayers=Math.max(2,Math.min(8,+U.maxPlayers.value||8));sync()}';
if(s.includes(oldChange)){s=s.replace(oldChange,newChange);changed++}
const hook='if(location.hostname==="127.0.0.1"||location.hostname==="localhost")window.QFTest={getState:()=>structuredClone(snap()),setEndsIn:ms=>{if(isHost&&S.status==="playing"){S.endsAt=Date.now()+Math.max(50,+ms||50);sync()}},finish:()=>isHost&&finishMatch("qa"),profile:()=>({...profile})};\nwire();';
if(!s.includes('window.QFTest=')){s=s.replace('wire();\n})();',hook+'\n})();');changed++}
await fs.writeFile(path,s);console.log(`V5 patches applied: ${changed}`);
if(!s.includes('function changeSetting(e)'))throw new Error('mode-setting patch missing');
if(!s.includes('window.QFTest='))throw new Error('QA hook missing');
