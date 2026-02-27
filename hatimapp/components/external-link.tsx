import { Text, TouchableOpacity } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof TouchableOpacity> & {
  href: string;
  children?: React.ReactNode;
};

export function ExternalLink({ href, children, ...rest }: Props) {
  return (
    <TouchableOpacity
      {...rest}
      onPress={async () => {
        if (process.env.EXPO_OS !== 'web') {
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        } else {
          window.open(href, '_blank');
        }
      }}
    >
      {children ?? <Text style={{ color: '#0a7ea4' }}>{href}</Text>}
    </TouchableOpacity>
  );
}
