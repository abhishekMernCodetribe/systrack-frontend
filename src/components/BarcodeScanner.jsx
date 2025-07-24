import React, { useEffect, useRef } from 'react'
import {BrowserMultiFormatReader} from '@zxing/browser';

const BarcodeScanner = () => {
   const videoRef = useRef(null);
   
   useEffect(()=>{
    const codeReader = new BrowserMultiFormatReader();
    codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
        if(result){
            onScan(result.getText());
        }
    });

    return () => codeReader.reset();

   }, [onScan]);
  return (
    <div>
        <video ref={videoRef} className='w-full h-auto rounded-lg border' />
    </div>
  )
}

export default BarcodeScanner