import * as React from 'react';
import { Text, View, StyleSheet, Modal, Linking, Button } from 'react-native';
import { BaseButton, TapGestureHandler } from 'react-native-gesture-handler';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
    };
  }

  toggleModal = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
    });
  };

  goToUrl = url => {
    Linking.canOpenURL(url).then(response => Linking.openURL(url));
  };

  render() {
    return (
      <View style={styles.container}>
        <TapGestureHandler
          onHandlerStateChange={({ nativeEvent }) => console.warn(nativeEvent)}>
          <Text>XXX</Text>
        </TapGestureHandler>
        <Text>
          onGestureEvent is not trigger when GestureHandler components is on a
          modal on Android
        </Text>
        <Text
          style={styles.link}
          onPress={() =>
            this.goToUrl(
              'https://github.com/kmagiera/react-native-gesture-handler/issues/139'
            )
          }>
          (See:
          https://github.com/kmagiera/react-native-gesture-handler/issues/139)
        </Text>

        <Text>Open the Modal dialog by push on the button below</Text>

        <View style={styles.devider} />

        <BaseButton style={styles.button} onPress={() => this.toggleModal()}>
          <Text>Open Modal Dialog</Text>
        </BaseButton>

        <Modal
          visible={this.state.modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.toggleModal()}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalInner}>
              <Text>
                Button #1 can close the dialog (Standard React Native Button
                component)
              </Text>

              <TapGestureHandler
                onHandlerStateChange={({ nativeEvent }) =>
                  console.warn(nativeEvent)
                }>
                <Text>XXX</Text>
              </TapGestureHandler>

              <View style={styles.devider} />

              <Text>
                Button #2 does not respond to pressing on Android (Gesture
                Handler "BaseButton")
              </Text>

              <View style={styles.devider} />

              <View style={styles.modalFooter}>
                <Button title="Button #1" onPress={() => this.toggleModal()} />
                <BaseButton
                  style={styles.button}
                  onPress={() => this.toggleModal()}>
                  <Text>Button #2</Text>
                </BaseButton>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 60,
  },
  devider: {
    height: 20,
  },
  button: {
    backgroundColor: '#DCDCDC',
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 40,
  },
  modalFooter: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: {
    color: '#0991FF',
    paddingVertical: 4,
  },
});
