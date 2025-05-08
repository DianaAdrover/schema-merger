// src/app/ThemeRegistry.tsx
'use client';

import {ReactNode, useMemo} from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';

export default function ThemeRegistry({ children }: { children: ReactNode }) {
    // Always use light mode
    const theme = useMemo(() => getTheme('light'), []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}