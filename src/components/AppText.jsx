import React from 'react';
import { Text } from 'react-native';
import { theme } from '../utils/theme';

export const AppText = ({
    children,
    variant = 'body',
    color = theme.colors.text,
    centered = false,
    style,
    ...props
}) => {
    return (
        <Text
            style={[
                theme.typography[variant],
                { color, textAlign: centered ? 'center' : 'auto' },
                style,
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};
