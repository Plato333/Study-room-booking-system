/// <reference types="vite/client" />

interface Window {
  ethereum?: import('ethers').Eip1193Provider & {
    isMetaMask?: boolean;
    on?: (event: string, callback: (...args: any[]) => void) => void;
    removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  };
}
