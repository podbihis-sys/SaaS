import { Modal, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type PickedImage = {
  uri: string;
  fileName: string;
  mimeType: string;
};

export type ImagePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  onPicked: (images: PickedImage[]) => void;
};

function deriveFile(asset: ImagePicker.ImagePickerAsset, index: number): PickedImage {
  const uri = asset.uri;
  const fileName = asset.fileName ?? `image-${Date.now()}-${index}.jpg`;
  const mimeType = asset.mimeType ?? 'image/jpeg';
  return { uri, fileName, mimeType };
}

export function ImagePickerSheet({ visible, onClose, onPicked }: ImagePickerSheetProps) {
  async function pickFromCamera(): Promise<void> {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      onClose();
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      exif: false,
    });
    if (!result.canceled) {
      onPicked(result.assets.map(deriveFile));
    }
    onClose();
  }

  async function pickFromLibrary(): Promise<void> {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      onClose();
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      exif: false,
    });
    if (!result.canceled) {
      onPicked(result.assets.map(deriveFile));
    }
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <View className="flex-1 justify-end">
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-background rounded-t-3xl p-5 pb-8 border-t border-border"
          >
            <Text className="text-base font-semibold text-foreground mb-4">Bilder hinzufuegen</Text>
            <Pressable
              onPress={pickFromCamera}
              className="h-12 rounded-xl bg-muted active:opacity-80 items-center justify-center mb-2"
            >
              <Text className="text-base font-medium text-foreground">Foto aufnehmen</Text>
            </Pressable>
            <Pressable
              onPress={pickFromLibrary}
              className="h-12 rounded-xl bg-muted active:opacity-80 items-center justify-center mb-2"
            >
              <Text className="text-base font-medium text-foreground">Aus Galerie waehlen</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="h-12 rounded-xl active:bg-muted items-center justify-center"
            >
              <Text className="text-base text-muted-foreground">Abbrechen</Text>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
