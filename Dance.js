import React, {
    Component
} from 'react';
import {
    StyleSheet,
    FlatList,
    Dimensions,
} from 'react-native'

import AnchorPostDisplay from './AnchorPostDisplay'
import FailPostDisplay from './FailPostDisplay'
import LoadPostDisplay from './LoadPostDisplay'
import EmptyPostDisplay from './EmptyPostDisplay'

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

class Dance extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadState: 0,    //加载状态。-1为加载失败，0为加载中，1为加载成功,2为空数据
            dataSource: ['loading'], //list的数据,其中'loading'，empty，false只是为了向dataSource中填充数据，否则datasource数量为0，不会走render渲染
            tagInfo: [],    //所有tag标签的数据
        };
    }

    componentWillMount() {
        this.post();
    }

    post() {
        var formdata = new FormData();
        formdata.append("rate", '1')
        formdata.append("type", 'u1')
        formdata.append("size", '0')
        formdata.append("p", '0')
        formdata.append("av", '2.7')

        console.log("【舞蹈 页面将要打开】");
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
                // console.log(json.content.u1);
                if (json.content.u1.length > 0) {
                    this.setState({
                        dataSource: json.content.u1,
                        tagInfo: json.content.tagInfo,
                        loadState: 1,
                    });
                } else {
                    this.setState({
                        dataSource: ['empty'],
                        tagInfo: json.content.tagInfo,
                        loadState: 2,
                    })
                }

            })
            .catch((error) => {
                console.log("【************* False *****************】 ");
                console.log(error)
                this.setState({
                    dataSource: ['false'],
                    loadState: -1,
                });
            })
    }

    returnAnchorItem(item) {
        console.log(this.state.loadState);
        switch (this.state.loadState) {
            //请求失败
            case -1: {//data.length = 1
                return (<FailPostDisplay layoutType={2}/>);
                break;
            }
            case 0: {
                return (<LoadPostDisplay layoutType={2}/>);
                break;
            }
            case 1: {
                return (<AnchorPostDisplay dataDic={item} tagsDic={this.state.tagInfo}/>);
                break;
            }
            case 2: {
                return (<EmptyPostDisplay layoutType={2}/>);
                break;
            }
        }
    }

    render() {
        return (
            <FlatList style={styles.list}
                      data={this.state.dataSource}
                      numColumns={2}
                      initialNumToRender={3}
                      getItemLayout={(data, index) => ({
                          length: (SCREEN_WIDTH - 24) * 0.61,
                          offset: (SCREEN_WIDTH - 24) * 0.61 * index,
                          index
                      })}
                      renderItem={({item, index}) =>
                          this.returnAnchorItem(item)
                      }
                      keyExtractor={(item, index) => index}
            />
        );
    }
}

const styles = StyleSheet.create({
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
        // width: (SCREEN_WIDTH - 21) / 2,
        // height: (SCREEN_WIDTH - 21) * 0.61,
        flexDirection: 'column',
        marginLeft: 7,
        marginTop: 7,
        borderRadius: 10,
        overflow: 'hidden',
    },
    cellItemImg: {
        width: (SCREEN_WIDTH - 21) / 2,
        height: (SCREEN_WIDTH - 21) / 2,
    },
    cellItemImgTagBar: {
        backgroundColor: 'rgba(0,0,0,0)',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: (SCREEN_WIDTH - 21) / 2 - 23,
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
});

module.exports = Dance;