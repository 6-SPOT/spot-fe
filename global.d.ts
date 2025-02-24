declare global {
    interface Window {
      Tmapv2: any;
      mapInstance?: any;
      marker?: any;
      handleGeocodingResponse?: (data: any) => void;
    }
  }
  
  export {};
  