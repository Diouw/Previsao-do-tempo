import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Button, Image, ImageBackground } from 'react-native';
import { Text, View } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';


import { API_KEY } from '../components/api/apiWeather';

const Index = () => {
  const [city, setCity] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [icon, setIcon] = useState(null);
  const [condition, setCondition] = useState(null);
  const [date, setDate] = useState(new Date);
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);

  const dia = require('../assets/images/dia.png')
  const noite = require('../assets/images/noite.png')

  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  {/*funcao para coletar os dados da api*/}
  const getLocationAndWeather = async () => {
    setLoading(true);
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
          setCity(address.city);
        else
          setCity(address.subregion);
      }

      {/*pegar os dados de hoje*/}
      const weatherResponse = await axios.get(`https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=${API_KEY}&units=M&lang=pt`);

      setIcon(weatherResponse.data.data[0].weather.icon);
      setTemperature(weatherResponse.data.data[0].temp);
      setCondition(weatherResponse.data.data[0].weather.description);

      {/*pegar os dados da semana*/}
      const forecastResponse = await axios.get(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${API_KEY}&units=M&lang=pt&days=7`);
      setForecast(forecastResponse.data.data);

      setDate(new Date);
    } catch (error) {
      console.log('Erro ao obter dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getLocationAndWeather();
  }, []);

  return (
    <ImageBackground source={dia} style={styles.background}>
      <ScrollView style={styles.container}>
        
        {/*cidade e data*/}
        <View style={styles.header}>
          <Text style={styles.city}>{city}</Text>
          <Text style={styles.date}>{date.getDate().toString() + ' de ' + meses[date.getMonth()] + ' de ' + date.getFullYear().toString()}</Text>
          <Text style={styles.date}>{date.getHours() + ':' + date.getMinutes().toString()}</Text>
        </View>

        {/*Temperatura atual, condicao e icone*/}
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
          {forecast.map((day, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastDay}>{new Date(day.valid_date).toLocaleDateString('pt-BR', { weekday: 'long' })}</Text>
              <Image
                source={{ uri: `https://www.weatherbit.io/static/img/icons/${day.weather.icon}.png` }}
                style={styles.forecastIcon}
              />
              <Text style={styles.forecastTemp}>{Math.round(day.temp)}°C</Text>
            </View>
          ))}
        </View>

          <View>
            <Button
              title={loading ? "Atualizando..." : "Atualizar Dados do Clima"}
              onPress={getLocationAndWeather}
            />
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
    padding: 20,
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
    fontSize: 18,
  },
  forecastIcon: {
    width: 50,
    height: 50,
  },
  forecastTemp: {
    fontSize: 18,
  },
});

export default Index;



