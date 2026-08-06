import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MENU_TOOLS } from '@/src/catalog/tools';
import { BrandLogo } from '@/src/components/BrandLogo';
import { colors, fonts, radii, space } from '@/src/theme';

function HamburgerIcon() {
  return (
    <View style={iconStyles.wrap} accessibilityLabel="Menú">
      <View style={iconStyles.bar} />
      <View style={iconStyles.bar} />
      <View style={iconStyles.bar} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: {
    width: 22,
    height: 16,
    justifyContent: 'space-between',
  },
  bar: {
    height: 2,
    backgroundColor: colors.ink,
    borderRadius: 1,
  },
});

export function HamburgerMenuButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={12}
        style={styles.btn}
        accessibilityRole="button"
        accessibilityLabel="Abrir menú"
      >
        <HamburgerIcon />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <SafeAreaView style={styles.drawer} edges={['top', 'bottom', 'left']}>
            <View style={styles.drawerHead}>
              <BrandLogo size={40} />
              <Text style={styles.drawerBrand}>ElectroCalc</Text>
            </View>

            {MENU_TOOLS.map((tool) => {
              const active =
                pathname === tool.href ||
                (tool.href === '/' && (pathname === '/' || pathname === '/index'));
              return (
                <View key={tool.id}>
                  {tool.id === 'help' ? <View style={styles.menuDivider} /> : null}
                  <Pressable
                    style={[styles.item, active && styles.itemActive]}
                    onPress={() => {
                      setOpen(false);
                      if (!active && tool.href) {
                        router.replace(tool.href);
                      }
                    }}
                  >
                    <Text style={[styles.itemText, active && styles.itemTextActive]}>
                      {tool.title}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginLeft: 4,
    padding: 8,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    width: 280,
    maxWidth: '82%',
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: space.md,
    paddingBottom: space.lg,
    zIndex: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 2, height: 0 },
  },
  drawerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: space.sm,
  },
  drawerBrand: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: radii.md,
  },
  itemActive: {
    backgroundColor: colors.tealSoft,
  },
  itemText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.ink,
  },
  itemTextActive: {
    color: colors.teal,
    fontFamily: fonts.bodySemi,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginVertical: 8,
    marginHorizontal: 4,
  },
});
