import React,{ useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, Button, Image, ImageBackground, FlatList, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text, View } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';


import { API_KEY } from '../components/api/apiWeather';

const Index = () => {
  const [city, setCity] = useState(null);
  const [rua, setRua] = useState(null);
  const [numero, setNumero] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [icon, setIcon] = useState(null);
  const [condition, setCondition] = useState(null);
  const [date, setDate] = useState(new Date);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);

  const dia = require('../assets/images/dia.png')
  const dia2 = require('../assets/images/dia2.png')
  const noite = require('../assets/images/noite.png')

  const refreshIcon = require('../assets/images/refresh.png');

  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  const rotation = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    rotation.setValue(0);
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotation = () => {
    rotation.stopAnimation();
  };

  const rotateData = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });



  {/*funcao para coletar os dados da api*/}
  const getLocationAndWeather = async () => {
    setLoading(true);
    startRotation();
    try {
      {/*permissao de localização*/}
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada');
        return;
      }

      {/*pegar as coordenadas*/}
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        let address = reverseGeocode[0];
        if(address.city == null)
          setCity(address.subregion);
        else
          setCity(address.city);
      }


      console.log(reverseGeocode);

      {/*pegar os dados de hoje*/}
      const weatherResponse = await axios.get(`https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=${API_KEY}&units=M&lang=pt`);

      setIcon(weatherResponse.data.data[0].weather.icon);
      setTemperature(weatherResponse.data.data[0].temp);
      setCondition(weatherResponse.data.data[0].weather.description);

      {/*pegar os dados da semana*/}
      const forecastResponse = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${API_KEY}&units=M&lang=pt&days=7`);
      // Obtém a data atual (apenas a parte do dia)
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      const tomorrowString = tomorrow.toISOString().split('T')[0];

      // Filtra para mostrar previsões apenas a partir de amanhã
      const forecastData = forecastResponse.data.data.filter(forecast => forecast.valid_date > tomorrowString);

      setForecast(forecastData);

      setDate(new Date);
    } catch (error) {
      console.log('Erro ao obter dados');
      console.error(error);
    } finally {
      setLoading(false);
      stopRotation();
    }
  };
  
  useEffect(() => {
    getLocationAndWeather();
  }, []);


  {/*flatlist*/}
  const renderItem = ({ item }) => (
    <View style={styles.forecastItem}>
        <View style={{flex:6}}>
          <Text style={styles.forecastDay}>
            {new Date(item.valid_date).toLocaleDateString('pt-BR', { weekday: 'long' })}
          </Text>
        </View>

        <View style={{flex:3}}>
          <Image
          source={{ uri: `https://www.weatherbit.io/static/img/icons/${item.weather.icon}.png` }}
          style={styles.forecastIcon}
          />
        </View>
      
      <View style={{flex:2}}>
        <Text style={styles.forecastTemp}>{Math.round(item.max_temp)}°C</Text>
        <Text style={styles.forecastTempMin}>{Math.round(item.min_temp)}°C</Text>
      </View>
    </View>
  );

  return (
    <ImageBackground source={dia} style={styles.background}>
      <ScrollView style={styles.container}>
        
        {/*cidade e data*/}
        <View style={styles.header}>
          <Text style={styles.city}>{city}</Text>
          <Text style={styles.date}>{date.getDate().toString() + ' de ' + meses[date.getMonth()] + ' de ' + date.getFullYear().toString()}</Text>
          <Text style={styles.date}>{date.getHours() + ':' + date.getMinutes().toString()}</Text>
        </View>

        {/*Temperatura atual, e icone*/}
        <View style={styles.currentWeather}>
          <Image
            source={{ uri: 'https://www.weatherbit.io/static/img/icons/' + icon + '.png' }}
            style={styles.weatherIcon}
          />
          <Text style={styles.temperature}>{Math.round(temperature) + '°C'}</Text>
          <Text style={styles.weatherDescription}>{condition}</Text>
        </View>

        {/*flatlist para a previsao dos proximos dias*/}
        <View style={styles.forecast}>
          <Text style={styles.forecastTitle}>Previsão para os próximos dias:</Text>
          <FlatList
            data={forecast}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        <View style={{marginBottom:50}}>
          <TouchableOpacity onPress={getLocationAndWeather}>
              <Animated.Image
                source={refreshIcon}
                style={[
                  styles.refreshIcon,
                  loading && { transform: [{ rotate: rotateData }] }, // Aplica rotação durante o carregamento
                ]}
              />
            </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};



const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    marginTop:50,
    alignItems: 'center',
    marginBottom: 20,
  },
  city: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 18,
    color: '#666',
  },
  currentWeather: {
    alignItems: 'center',
    marginBottom: 40,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  weatherDescription: {
    fontSize: 24,
    color: '#666',
  },
  forecast: {
    marginTop: 20,
  },
  forecastTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  forecastItem: {
    height:80,
    backgroundColor:'white',
    borderRadius:10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  forecastDay: {
    textAlign:'left',
    fontSize: 18,
    paddingLeft:20
  },
  forecastIcon: {
    width: 50,
    height: 50,
  },
  forecastTemp: {
    fontSize: 18,
  },
  refreshIcon: {
    width: 50,
    height: 50,
  },
  refreshIconLoading: {
  },
});

export default Index;



