import React, {
    Component,
} from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
    ActivityIndicator,
} from 'react-native'

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_5_8_DEVICE = Dimensions.get('window').height == 812;

class GoodVoiceLevelView extends React.Component {
    constructor(props) {
        super(props);
        this.levelData = [
            {
                "title": "全部",
                "iconURL": require('./images/LiveLobby/live_song_class_all_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_all_highlight.png'),
                "requestType": "u0",
            },
            {
                "title": "炽星",
                "iconURL": require('./images/LiveLobby/live_song_class_blazing_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_blazing_star_highlight.png'),
                "requestType": "r10",
            },
            {
                "title": "超星",
                "iconURL": require('./images/LiveLobby/live_song_class_super_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_super_star_highlight.png'),
                "requestType": "r5",
            },
            {
                "title": "巨星",
                "iconURL": require('./images/LiveLobby/live_song_class_big_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_big_star_highlight.png'),
                "requestType": "r4",
            },
            {
                "title": "明星",
                "iconURL": require('./images/LiveLobby/live_song_class_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_star_highlight.png'),
                "requestType": "r1",
            },
            {
                "title": "红人",
                "iconURL": require('./images/LiveLobby/live_song_class_little_star_normal.png'),
                "iconURL_H": require('./images/LiveLobby/live_song_class_little_star_highlight.png'),
                "requestType": "r2",
            },
        ];

        this.state = {
            nowLevelChose: 0,//level标签选择，0-5 同 anchorDataSource
        };
    }

    propTypes: {
        GoodVoiceCallbackSelect: PropTypes.func,
    }

    _onSelectLevel(index) {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'+index);
        // console.log(this.props.refreshInterval);
        console.log('----');
        this.setState({
            nowLevelChose: index,
        });
        this.props.GoodVoiceCallbackSelect(index);
    }

    renderListHeaderComponent() {
        if (IS_5_8_DEVICE) {
            return (
                <View>
                    <View style={[styles.listHeader, {height: 88}]}>
                    </View>
                </View>
            );
        } else {
            return (
                <View>
                    <View style={[styles.listHeader, {height: 64}]}></View>
                </View>
            );
        }
    }

    renderSeparationLine() {
        if (IS_5_8_DEVICE) {
            return (
                <View style={{position: 'absolute'}}>
                    <View style={{position: 'absolute'}}>
                        <View style={[styles.listHeader, {height: 88}]}></View>
                        <View style={{backgroundColor: 'rgba(220, 220, 220, 1)',height:1,width:SCREEN_WIDTH}}></View>
                        <View style={{marginTop:43,backgroundColor: 'rgba(220, 220, 220, 1)',height:1,width:SCREEN_WIDTH}}></View>
                        <View style={{marginTop:42,backgroundColor: 'rgba(220, 220, 220, 1)',height:1,width:SCREEN_WIDTH}}></View>
                    </View>
                    <View style={{position: 'absolute'}}>
                        <View style={[styles.listHeader, {height: 88}]}></View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{marginLeft:SCREEN_WIDTH/3 - 1,backgroundColor: 'rgba(220, 220, 220, 1)',height:88,width:1}}></View>
                            <View style={{marginLeft:SCREEN_WIDTH/3,backgroundColor: 'rgba(220, 220, 220, 1)',height:88,width:1}}></View>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={{position: 'absolute'}}>
                    <View style={{position: 'absolute'}}>
                        <View style={[styles.listHeader, {height: 64}]}></View>
                        <View style={{backgroundColor: 'rgba(220, 220, 220, 1)',height:1,width:SCREEN_WIDTH}}></View>
                        <View style={{backgroundColor:'white'}}>
                            <View style={{marginTop:43,backgroundColor: 'rgba(220, 220, 220, 1)',height:1,width:SCREEN_WIDTH}}></View>
                            <View style={{marginTop:42,backgroundColor: 'rgba(220, 220, 220, 1)',height:1,width:SCREEN_WIDTH}}></View>
                        </View>
                    </View>
                    <View style={{position: 'absolute'}}>
                        <View style={[styles.listHeader, {height: 64}]}></View>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{marginLeft:SCREEN_WIDTH/3 - 1,backgroundColor: 'rgba(220, 220, 220, 1)',height:88,width:1}}></View>
                            <View style={{marginLeft:SCREEN_WIDTH/3,backgroundColor: 'rgba(220, 220, 220, 1)',height:88,width:1}}></View>
                        </View>
                    </View>
                </View>

            );
        }
    }

    render() {
        // console.log('chose : '+ this.state.nowLevelChose);
        return (
            <View>
                {this.renderListHeaderComponent()}
                {this.renderSeparationLine()}
                <FlatList data={this.levelData}
                          extraData={this.state.nowLevelChose}
                          numColumns={3}
                          renderItem={({item, index}) => {
                              if (index == this.state.nowLevelChose) {
                                  return (
                                      <View style={styles.levelViewItem}>
                                          <Image source={item.iconURL_H}/>
                                          <Text style={{
                                              marginLeft: 6,
                                              color: 'rgba(255,0,146,1)'
                                          }}>{item.title}</Text>
                                      </View>
                                  );
                              } else {
                                  return (
                                      <TouchableWithoutFeedback onPress={() => this._onSelectLevel(index)}>
                                          <View style={styles.levelViewItem}>
                                              <Image source={item.iconURL}/>
                                              <Text style={{marginLeft: 6}}>{item.title}</Text>
                                          </View>
                                      </TouchableWithoutFeedback>
                                  );

                              }
                          }
                          }
                          keyExtractor={(item, index) => index}
                >
                </FlatList>
            </View>
        );
    }

}

const
    styles = StyleSheet.create({
        levelViewItem: {
            // backgroundColor: 'white',//white
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: 44,
            width: SCREEN_WIDTH / 3,
        },
        listHeader: {
            marginLeft: 0,
            marginTop: 0,
            width: SCREEN_WIDTH,
        },
    });

module.exports = GoodVoiceLevelView;