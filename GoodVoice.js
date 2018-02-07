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
    ImageBackground,
    ActivityIndicator,
} from 'react-native'
import AnchorPostDisplay from './AnchorPostDisplay'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

var isNeedupLoad = [true, true, true, true, true, true];

class GoodVoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功
            nowLevelChose: 0,
            dataSource_u0: [],
            dataSource_r10: [],
            dataSource_r5: [],
            dataSource_r4: [],
            dataSource_r1: [],
            dataSource_r2: [],
            tagInfo: [],
            levelData: [
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
            ],
        };
    }

    componentWillMount() {
        var formdata = new FormData();
        formdata.append("rate", '1');
        formdata.append("type", 'u0');
        formdata.append("size", '0');
        formdata.append("p", '0');
        formdata.append("av", '2.1');

        console.log("【好声音 页面将要打开】");
        fetch('http://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getlivelistnew.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formdata,
        })
            .then((response) => response.json())
            .then((json) => {
                console.log("【************* Success *****************】 ");
                // console.log(json)
                // console.log(json.content.u0[0].username)
                console.log(json.content.tagInfo.length);
                this.setState({
                    loadState: 1,
                    dataSource_u0: json.content.u0,
                    tagInfo: json.content.tagInfo,
                });
            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error);
                this.setState({
                    loadState: -1,
                });
            })
    }

    _onSelectAnchor(index) {
        console.log('click: ' + this.state.dataSource[index].username + ' ' + this.state.dataSource[index].rid);
    }

    //tagIDs 为 每个cellItem的tagID的集合
    showTag(tagIDs) {
        if (tagIDs.length > 0) {
            switch (tagIDs.length) {
                case 1: {
                    return (
                        <View style={styles.cellItemImgTagBar}>
                            {this.getTagView(tagIDs[0], true)}
                        </View>
                    );
                    break;
                }
                case 2: {
                    return (
                        <View style={styles.cellItemImgTagBar}>
                            {this.getTagView(tagIDs[0], true)}
                            {this.getTagView(tagIDs[1], false)}
                        </View>
                    );
                    break;
                }
                case 3: {
                    return (
                        <View style={styles.cellItemImgTagBar}>
                            {this.getTagView(tagIDs[0], true)}
                            {this.getTagView(tagIDs[1], false)}
                            {this.getTagView(tagIDs[2], false)}
                        </View>
                    );
                    break;
                }
                case 4: {
                    return (
                        <View style={styles.cellItemImgTagBar}>
                            {this.getTagView(tagIDs[0], true)}
                            {this.getTagView(tagIDs[1], false)}
                            {this.getTagView(tagIDs[2], false)}
                            {this.getTagView(tagIDs[4], false)}
                        </View>
                    );
                    break;
                }
            }
        }
    }

    getTagView(tagID, isFirstTag) {
        var index = 0;
        while (index < this.state.tagInfo.length) {
            if (tagID == this.state.tagInfo[index].id) {
                if (isFirstTag) {
                    return (<Image
                        style={{
                            width: this.state.tagInfo[index].viewPicSmall.img2xw / 2,
                            height: this.state.tagInfo[index].viewPicSmall.img2xh / 2,
                            marginLeft: 8,
                            marginBottom: 5,
                        }}
                        source={{uri: this.state.tagInfo[index].viewPicSmall.img2x}}/>);
                } else {
                    return (<Image
                        style={{
                            width: this.state.tagInfo[index].viewPicSmall.img2xw / 2,
                            height: this.state.tagInfo[index].viewPicSmall.img2xh / 2,
                            marginLeft: 5,
                            marginBottom: 5,
                        }}
                        source={{uri: this.state.tagInfo[index].viewPicSmall.img2x}}/>);
                }
            }
            index++;
        }
    }

    showChoseLevelView() {
        // console.log(this.state.nowLevelChose);
        return (
            <FlatList style={styles.levelView}
                      data={this.state.levelData}
                      numColumns={3}
                      renderItem={({item, index}) => {
                          if (index == this.state.nowLevelChose) {
                              return (
                                  <TouchableWithoutFeedback onPress={() => this._onSelectLevel(index)}>
                                      <View style={styles.levelViewItem}>
                                          <Image source={item.iconURL_H}/>
                                          <Text style={{marginLeft: 6, color: 'rgba(255,0,146,1)'}}>{item.title}</Text>
                                      </View>
                                  </TouchableWithoutFeedback>
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
        )
    }

    _onSelectLevel(index) {
        if (index != this.state.nowLevelChose) {

            var formdata = new FormData();
            formdata.append("rate", '1');
            formdata.append("type", this.state.levelData[index].requestType);
            formdata.append("size", '0');
            formdata.append("p", '0');
            formdata.append("av", '2.1');

            console.log(formdata);

            if (isNeedupLoad[index]) {
                isNeedupLoad[index] = false;
                console.log('==================【需要更新】=====================');

                this.setState({
                    loadState: 0,
                });

                fetch('http://v.6.cn/coop/mobile/index.php?padapi=coop-mobile-getlivelistnew.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formdata,
                })
                    .then((response) => response.json())
                    .then((json) => {
                        console.log("【************* Success *****************】 ");
                        switch (index) {
                            case 0: {
                                this.timer = setTimeout(
                                    () => {
                                        isNeedupLoad[index] = true;
                                        console.log(this.state.levelData[index].title + "可以更新了");
                                    },
                                    180000
                                );
                                this.setState({
                                    loadState: 1,
                                    dataSource_u0: json.content.u0,
                                    tagInfo: json.content.tagInfo,
                                    nowLevelChose: index,
                                });
                                break;
                            }
                            case 1: {
                                this.timer = setTimeout(
                                    () => {
                                        isNeedupLoad[index] = true;
                                        console.log(this.state.levelData[index].title + "可以更新了");
                                    },
                                    180000
                                );
                                this.setState({
                                    loadState: 1,
                                    dataSource_r10: json.content.r10,
                                    tagInfo: json.content.tagInfo,
                                    nowLevelChose: index,
                                });
                                break;
                            }
                            case 2: {
                                this.timer = setTimeout(
                                    () => {
                                        isNeedupLoad[index] = true;
                                        console.log(this.state.levelData[index].title + "可以更新了");
                                    },
                                    180000
                                );

                                this.setState({
                                    loadState: 1,
                                    dataSource_r5: json.content.r5,
                                    tagInfo: json.content.tagInfo,
                                    nowLevelChose: index,
                                });
                                break;
                            }
                            case 3: {
                                this.timer = setTimeout(
                                    () => {
                                        isNeedupLoad[index] = true;
                                        console.log(this.state.levelData[index].title + "可以更新了");
                                    },
                                    180000
                                );

                                this.setState({
                                    loadState: 1,
                                    dataSource_r4: json.content.r4,
                                    tagInfo: json.content.tagInfo,
                                    nowLevelChose: index,
                                });
                                break;
                            }
                            case 4: {
                                this.timer = setTimeout(
                                    () => {
                                        isNeedupLoad[index] = true;
                                        console.log(this.state.levelData[index].title + "可以更新了");
                                    },
                                    180000
                                );

                                this.setState({
                                    loadState: 1,
                                    dataSource_r1: json.content.r1,
                                    tagInfo: json.content.tagInfo,
                                    nowLevelChose: index,
                                });
                                break;
                            }
                            case 5: {
                                this.timer = setTimeout(
                                    () => {
                                        isNeedupLoad[index] = true;
                                        console.log(this.state.levelData[index].title + "可以更新了");
                                    },
                                    180000
                                );

                                this.setState({
                                    loadState: 1,
                                    dataSource_r2: json.content.r2,
                                    tagInfo: json.content.tagInfo,
                                    nowLevelChose: index,
                                });
                                break;
                            }
                        }

                    })
                    .catch((error) => {
                        console.log("【************* False *****************】 ");
                        console.log(error);
                        this.setState({
                            loadState: -1,
                        });
                    })
            } else {
                this.setState({
                    nowLevelChose: index,
                });
                console.log("没到时间，不需要更新")
            }
        }
    }

    getDataSource() {
        switch (this.state.nowLevelChose) {
            case 0: {
                return this.state.dataSource_u0;
                break;
            }
            case 1: {
                return this.state.dataSource_r10;
                break;
            }
            case 2: {
                return this.state.dataSource_r5;
                break;
            }
            case 3: {
                return this.state.dataSource_r4;
                break;
            }
            case 4: {
                return this.state.dataSource_r1;
                break;
            }
            case 5: {
                return this.state.dataSource_r2;
                break;
            }
        }
    }

    renderAnchorCell(item, index) {
        switch (this.state.loadState) {
            case -1: {//同样存在问题，如果请求失败，则数据为空，不会进行渲染
                // return (
                //     <View style={styles.failLoadContainer}>
                //         <Text style={styles.failLoadContainerText}>请下拉刷新试试</Text>
                //     </View>
                // );
                // break;
            }
            case 0: {
                return (
                    <View style={styles.waitLoadContainer}>
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={styles.waitLoadContainerIndicator}
                            size="large"/>
                    </View>
                );
                break;
            }
            case 1: {
                if (this.getDataSource().length > 0) {
                    return (
                        <View style={styles.cell}>
                            <TouchableWithoutFeedback onPress={() => this._onSelectAnchor(index)}>
                                <View style={styles.cellItem}>
                                    <View style={styles.cellItemImg}>
                                        <ImageBackground style={styles.cellItemImg}
                                                         source={{uri: item.pospic}}>
                                            {this.showTag(item.tagids)}
                                        </ImageBackground>
                                    </View>
                                    <View style={styles.cellItemBottomBar}>
                                        <Text style={styles.cellItemBottomBarName}
                                              numberOfLines={1}>{item.username}</Text>
                                        <Image style={styles.cellItemBottomBarIcon}
                                               source={require('./images/LiveLobby2/liveLobby_cell_Item_audienceCount.png')}/>
                                        <Text
                                            style={styles.cellItemBottomBarCount}>{item.count}</Text>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    );
                } else {//空数据现在有问题,如果为空数据，则dataSource数据为0，不显示cell内容
                    // return (
                    //     <ImageBackground style={styles.waitLoadContainer}
                    //                      source={require('./images/LiveLobby/live_list_icon_anchorEmpty.png')}
                    //                      resizeMode='stretch'>
                    //         <Image style={styles.waitLoadContainerIndicator}
                    //                source={require('./images/LiveLobby/live_list_icon_anchorEmpty.png')}
                    //         />
                    //     </ImageBackground>
                    // );
                }
            }
        }
    }

    render() {
        return (
            <View>
                <FlatList style={styles.list}
                          data={this.getDataSource()}
                          numColumns={2}
                          getItemLayout={(data, index) => ({
                              length: (SCREEN_WIDTH - 24) * 0.61,
                              offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                              index
                          })}
                          initialNumToRender={3}
                          ListHeaderComponent={this.showChoseLevelView.bind(this)}
                          renderItem={({item, index}) =>
                              this.renderAnchorCell(item, index)
                          }
                          keyExtractor={(item, index) => index}
                />
            </View>
        );
    }
}

const
    styles = StyleSheet.create({
        levelViewCell: {
            height: 44,
            backgroundColor: 'gray',
        },
        levelViewItem: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            height: 44,
            width: SCREEN_WIDTH / 3,
            borderWidth: 0.5,
            borderLeftWidth: 0,
            borderColor: 'rgba(220, 220, 220, 1)',
        },
        list: {
            backgroundColor: 'rgba(240,240,240,1)',
            height: SCREEN_HEIGHT - 115,
        },
        cell: {
            marginLeft: 0,
            marginTop: 0,
            paddingBottom: 0,
            //0.61 = 440 / 360; 440:cellHeight ;    360: ItemWidth
            overflow: 'hidden',
        },
        cellItem: {
            width: (SCREEN_WIDTH - 21) / 2,
            height: (SCREEN_WIDTH - 21) * 0.61,
            flexDirection: 'column',
            marginLeft: 7,
            marginTop: 7,
            borderRadius: 10,
            overflow: 'hidden',
        },
        cellItemImg: {
            width: (SCREEN_WIDTH - 21) / 2,
            height: (SCREEN_WIDTH - 21) * 0.61 - 36,
            paddingBottom: 36,
        },
        cellItemImgTagBar: {
            backgroundColor: 'rgba(0,0,0,0)',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: (SCREEN_WIDTH - 21) * 0.61 - 59,
        },
        cellItemBottomBar: {
            flexDirection: 'row',
            justifyContent: 'space-around', //定义了伸缩项目在主轴线的对齐方式
            alignItems: 'center',
            height: 36,
            backgroundColor: 'white',
        },
        cellItemBottomBarName: {
            letterSpacing: 0,
            marginLeft: 8,
            marginBottom: 4,
            width: 90,
            fontSize: 12,
        },
        cellItemBottomBarIcon: {
            width: 12,
            height: 10,
            marginRight: 0,
            marginLeft: 4,
            marginBottom: 4,
        },
        cellItemBottomBarCount: {
            width: 40,
            marginRight: 2,
            marginBottom: 4,
            letterSpacing: 0,
            fontSize: 12,
        },
        //WaitLoading
        waitLoadContainer: {
            height: SCREEN_HEIGHT - 170,
            width: SCREEN_WIDTH,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(240,240,240,1)',
        },
        waitLoadContainerIndicator: {
            height: 80,
        },
        //FailLoading
        failLoadContainer: {
            height: SCREEN_HEIGHT - 170,
            width: SCREEN_WIDTH,
            // paddingTop:200,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(240,240,240,1)',
        },
        failLoadContainerText: {
            color: 'gray',
        }
    });

module.exports = GoodVoice;