import { createTheme, PaletteMode } from '@mui/material/styles';
import {blue} from "@mui/material/colors";

export const getTheme = (mode: PaletteMode) => createTheme({
    palette: {
        mode, // This applies the light/dark mode
        primary: {
            main: '#4dd0e1',      // From institutional CSS
            dark: '#35919d',      // From institutional CSS
            light: '#70d9e7',     // From institutional CSS
            contrastText: '#fff',
        },
        secondary: {
            main: blue["A400"],      // Keeping your secondary color
            light: blue["A200"], // Light blue
            dark: blue["A700"],
            contrastText: '#fff',
        },
        background: {
            default: mode === 'dark' ? '#121212' : '#ffffff',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Fira Sans", "Geist", "Roboto", "Arial", sans-serif',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                pre: {
                    fontFamily: '"IBM Plex Mono", "Geist Mono", monospace',
                },
                code: {
                    fontFamily: '"IBM Plex Mono", "Geist Mono", monospace',
                }
            },
        },
    },
});